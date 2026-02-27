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

    // Obtener datos del usuario de Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    const customerId = userData?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json(
        { message: 'No Stripe customer found. Please subscribe first.' },
        { status: 400 }
      );
    }

    // Crear sesión del portal de cliente
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/manage`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
