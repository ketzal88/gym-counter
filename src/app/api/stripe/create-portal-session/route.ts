import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { rateLimit, tooManyRequests } from '@/lib/rateLimit';

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
    let userId: string;
    try {
      userId = (await auth.verifyIdToken(token)).uid;
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    if (!(await rateLimit(`portal_${userId}`, 20, 60 * 60 * 1000))) {
      return NextResponse.json(tooManyRequests, { status: 429 });
    }

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
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
