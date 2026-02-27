import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  });
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Obtener tier del body
    const { tier } = await request.json();

    if (!tier || !['monthly', 'annual'].includes(tier)) {
      return NextResponse.json(
        { message: 'Invalid tier. Must be "monthly" or "annual"' },
        { status: 400 }
      );
    }

    // Obtener precio ID según el tier
    const priceId = tier === 'monthly'
      ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
      : process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { message: 'Price ID not configured' },
        { status: 500 }
      );
    }

    // Obtener datos del usuario de Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    // Crear o recuperar customer de Stripe
    let customerId = userData?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.email || '',
        metadata: {
          userId,
        },
      });
      customerId = customer.id;

      // Guardar customer ID en Firestore
      await db.collection('users').doc(userId).update({
        stripeCustomerId: customerId,
      });
    }

    // Crear sesión de Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/paywall?checkout=cancelled`,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId,
        },
      },
      metadata: {
        userId,
        tier,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
