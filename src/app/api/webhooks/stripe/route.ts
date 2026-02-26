import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
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
          subscriptionStartDate: Timestamp.fromMillis(subscription.current_period_start * 1000),
          subscriptionEndDate: Timestamp.fromMillis(subscription.current_period_end * 1000),
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
            subscriptionStartDate: Timestamp.fromMillis(subscription.current_period_start * 1000),
            subscriptionEndDate: Timestamp.fromMillis(subscription.current_period_end * 1000),
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
            subscriptionStartDate: Timestamp.fromMillis(subscription.current_period_start * 1000),
            subscriptionEndDate: Timestamp.fromMillis(subscription.current_period_end * 1000),
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

          console.log(`✅ Subscription cancelled for user ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

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

        console.log(`📅 Trial ending soon for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
