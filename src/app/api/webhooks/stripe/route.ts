import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore, Timestamp, DocumentReference } from 'firebase-admin/firestore';
import { notifySubscription, notifyError } from '@/lib/slack';

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
        { message: `Webhook Error: ${message}` },
        { status: 400 }
      );
    }

    const db = getFirestore();

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

    // Manejar eventos según tipo
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error('No userId in checkout session metadata');
          break;
        }

        // Obtener la suscripción
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Actualizar usuario en Firestore
        await db.collection('users').doc(userId).update({
          subscriptionStatus: subscription.status === 'trialing' ? 'trial' : 'active',
          stripeSubscriptionId: subscriptionId,
          subscriptionTier: session.metadata?.tier || 'monthly',
          subscriptionStartDate: Timestamp.fromMillis(subscription.items.data[0].current_period_start * 1000),
          subscriptionEndDate: Timestamp.fromMillis(subscription.items.data[0].current_period_end * 1000),
        });

        // Registrar evento
        await db.collection('subscriptionEvents').add({
          userId,
          eventType: 'subscription_created',
          timestamp: Timestamp.now(),
          data: {
            subscriptionId,
            tier: session.metadata?.tier,
            status: subscription.status,
          },
          stripeEventId: event.id,
        });

        // Slack notification
        const checkoutUser = await db.collection('users').doc(userId).get();
        const checkoutEmail = checkoutUser.data()?.email || userId;
        await notifySubscription('started', userId, checkoutEmail, session.metadata?.tier || 'monthly');

        console.log(`✅ Checkout completed for user ${userId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          // Intentar obtener userId desde customer
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          if (customer.deleted) break;
          const userSnapshot = await db.collection('users')
            .where('stripeCustomerId', '==', customer.id)
            .limit(1)
            .get();

          if (userSnapshot.empty) {
            console.error('No user found for customer:', customer.id);
            break;
          }

          const userDoc = userSnapshot.docs[0];
          const actualUserId = userDoc.id;

          // Actualizar suscripción
          await db.collection('users').doc(actualUserId).update({
            subscriptionStatus: subscription.status === 'trialing' ? 'trial' : subscription.status === 'active' ? 'active' : 'cancelled',
            subscriptionStartDate: Timestamp.fromMillis(subscription.items.data[0].current_period_start * 1000),
            subscriptionEndDate: Timestamp.fromMillis(subscription.items.data[0].current_period_end * 1000),
            subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          });

          // Registrar evento
          await db.collection('subscriptionEvents').add({
            userId: actualUserId,
            eventType: 'subscription_updated',
            timestamp: Timestamp.now(),
            data: {
              status: subscription.status,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
            stripeEventId: event.id,
          });

          console.log(`✅ Subscription updated for user ${actualUserId}`);
        } else {
          // Actualizar suscripción
          await db.collection('users').doc(userId).update({
            subscriptionStatus: subscription.status === 'trialing' ? 'trial' : subscription.status === 'active' ? 'active' : 'cancelled',
            subscriptionStartDate: Timestamp.fromMillis(subscription.items.data[0].current_period_start * 1000),
            subscriptionEndDate: Timestamp.fromMillis(subscription.items.data[0].current_period_end * 1000),
            subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          });

          // Registrar evento
          await db.collection('subscriptionEvents').add({
            userId,
            eventType: 'subscription_updated',
            timestamp: Timestamp.now(),
            data: {
              status: subscription.status,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
            stripeEventId: event.id,
          });

          console.log(`✅ Subscription updated for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          // Intentar obtener userId desde customer
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          if (customer.deleted) break;
          const userSnapshot = await db.collection('users')
            .where('stripeCustomerId', '==', customer.id)
            .limit(1)
            .get();

          if (userSnapshot.empty) {
            console.error('No user found for customer:', customer.id);
            break;
          }

          const userDoc = userSnapshot.docs[0];
          const actualUserId = userDoc.id;

          // Marcar suscripción como cancelada
          await db.collection('users').doc(actualUserId).update({
            subscriptionStatus: 'cancelled',
          });

          // Registrar evento
          await db.collection('subscriptionEvents').add({
            userId: actualUserId,
            eventType: 'subscription_cancelled',
            timestamp: Timestamp.now(),
            data: {
              reason: 'deleted',
            },
            stripeEventId: event.id,
          });

          // Slack notification
          const cancelledUser1 = await db.collection('users').doc(actualUserId).get();
          await notifySubscription('cancelled', actualUserId, cancelledUser1.data()?.email || actualUserId);

          console.log(`✅ Subscription cancelled for user ${actualUserId}`);
        } else {
          // Marcar suscripción como cancelada
          await db.collection('users').doc(userId).update({
            subscriptionStatus: 'cancelled',
          });

          // Registrar evento
          await db.collection('subscriptionEvents').add({
            userId,
            eventType: 'subscription_cancelled',
            timestamp: Timestamp.now(),
            data: {
              reason: 'deleted',
            },
            stripeEventId: event.id,
          });

          // Slack notification
          const cancelledUser2 = await db.collection('users').doc(userId).get();
          await notifySubscription('cancelled', userId, cancelledUser2.data()?.email || userId);

          console.log(`✅ Subscription cancelled for user ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.parent?.subscription_details?.subscription === 'string'
          ? invoice.parent.subscription_details.subscription
          : invoice.parent?.subscription_details?.subscription?.id;

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata?.userId;

        if (!userId) {
          // Intentar obtener userId desde customer
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          if (customer.deleted) break;
          const userSnapshot = await db.collection('users')
            .where('stripeCustomerId', '==', customer.id)
            .limit(1)
            .get();

          if (userSnapshot.empty) {
            console.error('No user found for customer:', customer.id);
            break;
          }

          const userDoc = userSnapshot.docs[0];
          const actualUserId = userDoc.id;

          // Registrar evento de fallo de pago
          await db.collection('subscriptionEvents').add({
            userId: actualUserId,
            eventType: 'payment_failed',
            timestamp: Timestamp.now(),
            data: {
              invoiceId: invoice.id,
              amount: invoice.amount_due,
            },
            stripeEventId: event.id,
          });

          // Slack notification
          const failedUser1 = await db.collection('users').doc(actualUserId).get();
          await notifySubscription('payment_failed', actualUserId, failedUser1.data()?.email || actualUserId);

          console.log(`⚠️ Payment failed for user ${actualUserId}`);
        } else {
          // Registrar evento de fallo de pago
          await db.collection('subscriptionEvents').add({
            userId,
            eventType: 'payment_failed',
            timestamp: Timestamp.now(),
            data: {
              invoiceId: invoice.id,
              amount: invoice.amount_due,
            },
            stripeEventId: event.id,
          });

          // Slack notification
          const failedUser2 = await db.collection('users').doc(userId).get();
          await notifySubscription('payment_failed', userId, failedUser2.data()?.email || userId);

          console.log(`⚠️ Payment failed for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        // Registrar evento de recordatorio de trial
        await db.collection('subscriptionEvents').add({
          userId,
          eventType: 'trial_will_end',
          timestamp: Timestamp.now(),
          data: {
            trialEnd: subscription.trial_end,
          },
          stripeEventId: event.id,
        });

        // Slack notification
        const trialUser = await db.collection('users').doc(userId).get();
        await notifySubscription('trial_ending', userId, trialUser.data()?.email || userId);

        console.log(`📅 Trial ending soon for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    // El procesamiento falló DESPUÉS de reclamar el evento: liberamos el candado para que
    // el reintento de Stripe pueda reprocesarlo (si no, quedaría marcado como procesado).
    if (processedRef) {
      await processedRef.delete().catch(() => { /* best-effort: no bloquear la respuesta 500 */ });
    }
    console.error('Webhook handler error:', error);
    await notifyError('stripe-webhook', error instanceof Error ? error.message : 'Webhook handler failed', error instanceof Error ? error.stack : undefined);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
