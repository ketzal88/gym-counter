import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Timestamp, DocumentReference } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
import { notifySubscription, notifyError } from '@/lib/slack';
import { mapStatus, idOf, currentPeriod } from '@/lib/stripeWebhook';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  });
}

// Firestore create() rechaza con gRPC ALREADY_EXISTS (código 6) si el doc ya existe.
// Lo usamos como candado de idempotencia atómico para el reintento de webhooks.
function isAlreadyExists(err: unknown): boolean {
  const code = (err as { code?: number | string })?.code;
  if (code === 6 || code === 'already-exists') return true;
  const message = err instanceof Error ? err.message : '';
  return /already exists/i.test(message);
}

/** userId desde la metadata de la suscripción o, si falta, buscando por stripeCustomerId. */
async function resolveUserId(subscription: Stripe.Subscription): Promise<string | null> {
  if (subscription.metadata?.userId) return subscription.metadata.userId;
  const customerId = idOf(subscription.customer);
  if (!customerId) return null;
  const snap = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
  if (snap.empty) {
    console.error('No user found for customer:', customerId);
    return null;
  }
  return snap.docs[0].id;
}

function periodFields(subscription: Stripe.Subscription) {
  const period = currentPeriod(subscription);
  if (!period) return {};
  return {
    subscriptionStartDate: Timestamp.fromMillis(period.startMs),
    subscriptionEndDate: Timestamp.fromMillis(period.endMs),
  };
}

async function emailOf(userId: string): Promise<string> {
  return (await db.collection('users').doc(userId).get()).data()?.email || userId;
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  // Se setea sólo si LOGRAMOS reclamar el evento (create exitoso). Si el procesamiento
  // falla después, lo liberamos en el catch para que el reintento de Stripe reprocese.
  let processedRef: DocumentReference | null = null;
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { message: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verificar firma del webhook
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', message);
      return NextResponse.json(
        { message: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Idempotencia: Stripe reintenta entregas. Reclamamos el event.id de forma atómica
    // con create() (falla si ya existe) ANTES de mutar. Si es un reintento ya procesado,
    // devolvemos 200 sin re-ejecutar mutaciones ni notificaciones a Slack.
    // Ver .claude/rules/firestore-conventions.md (idempotencia del webhook Stripe).
    const claimRef = db.collection('processedStripeEvents').doc(event.id);
    try {
      await claimRef.create({ type: event.type, processedAt: Timestamp.now() });
      processedRef = claimRef;
    } catch (err: unknown) {
      if (isAlreadyExists(err)) {
        console.log(`↩️ Evento Stripe duplicado ${event.id} (${event.type}) — ya procesado, se omite`);
        return NextResponse.json({ received: true, duplicate: true });
      }
      throw err; // otro error (no reclamamos): que el catch externo devuelva 500 y Stripe reintente
    }

    // Registro del evento con ID determinístico (= event.id): si un reintento reprocesa
    // después de una falla parcial, sobrescribe la misma fila en vez de duplicarla.
    const recordEvent = (data: Record<string, unknown>) =>
      db.collection('subscriptionEvents').doc(event.id).set({
        ...data,
        timestamp: Timestamp.now(),
        stripeEventId: event.id,
      });

    // Slack va DESPUÉS de aplicar todas las mutaciones y fuera del camino que libera el
    // candado: una falla de Slack no debe provocar reprocesos ni avisos duplicados.
    const notifications: Array<() => Promise<unknown>> = [];

    // Manejar eventos según tipo
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = idOf(session.subscription);

        if (!userId) {
          console.error('No userId in checkout session metadata');
          break;
        }
        if (!subscriptionId) {
          console.log(`Checkout ${session.id} sin suscripción — se ignora`);
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const tier = session.metadata?.tier || 'monthly';

        await db.collection('users').doc(userId).set({
          subscriptionStatus: subscription.status === 'trialing' ? 'trial' : 'active',
          stripeSubscriptionId: subscriptionId,
          subscriptionTier: tier,
          ...periodFields(subscription),
        }, { merge: true });

        await recordEvent({
          userId,
          eventType: 'subscription_created',
          data: { subscriptionId, tier: session.metadata?.tier ?? null, status: subscription.status },
        });

        notifications.push(async () => notifySubscription('started', userId, await emailOf(userId), tier));
        console.log(`✅ Checkout completed for user ${userId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(subscription);
        if (!userId) break;

        await db.collection('users').doc(userId).set({
          subscriptionStatus: mapStatus(subscription.status),
          ...periodFields(subscription),
          subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        }, { merge: true });

        await recordEvent({
          userId,
          eventType: 'subscription_updated',
          data: { status: subscription.status, cancelAtPeriodEnd: subscription.cancel_at_period_end },
        });

        console.log(`✅ Subscription updated for user ${userId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(subscription);
        if (!userId) break;

        await db.collection('users').doc(userId).set({ subscriptionStatus: 'cancelled' }, { merge: true });

        await recordEvent({
          userId,
          eventType: 'subscription_cancelled',
          data: { reason: 'deleted' },
        });

        notifications.push(async () => notifySubscription('cancelled', userId, await emailOf(userId)));
        console.log(`✅ Subscription cancelled for user ${userId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = idOf(invoice.parent?.subscription_details?.subscription);
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = await resolveUserId(subscription);
        if (!userId) break;

        await recordEvent({
          userId,
          eventType: 'payment_failed',
          data: { invoiceId: invoice.id, amount: invoice.amount_due },
        });

        notifications.push(async () => notifySubscription('payment_failed', userId, await emailOf(userId)));
        console.log(`⚠️ Payment failed for user ${userId}`);
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(subscription);
        if (!userId) break;

        await recordEvent({
          userId,
          eventType: 'trial_will_end',
          data: { trialEnd: subscription.trial_end },
        });

        notifications.push(async () => notifySubscription('trial_ending', userId, await emailOf(userId)));
        console.log(`📅 Trial ending soon for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mutaciones aplicadas: desde acá el claim queda firme aunque falle Slack.
    processedRef = null;
    for (const notify of notifications) {
      await notify().catch((err) => console.error('Slack notification failed (event already applied):', err));
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    // El procesamiento falló DESPUÉS de reclamar el evento: liberamos el candado para que
    // el reintento de Stripe pueda reprocesarlo (si no, quedaría marcado como procesado).
    if (processedRef) {
      const ref = processedRef;
      await ref.delete().catch((err) => {
        // Si esto falla el evento queda marcado como procesado sin aplicarse: hay que reprocesarlo a mano.
        console.error(`CRITICAL: no se pudo liberar el claim ${ref.id}; el evento no se reintentará`, err);
      });
    }
    console.error('Webhook handler error:', error);
    await notifyError('stripe-webhook', error instanceof Error ? error.message : 'Webhook handler failed', error instanceof Error ? error.stack : undefined);
    return NextResponse.json({ message: 'Webhook handler failed' }, { status: 500 });
  }
}
