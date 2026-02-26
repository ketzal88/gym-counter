import { loadStripe } from '@stripe/stripe-js';

// Inicializar Stripe con la clave pública
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

/**
 * Crea una sesión de Stripe Checkout y redirige al usuario
 */
export async function createCheckoutSession(tier: 'monthly' | 'annual'): Promise<void> {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tier }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const { sessionId } = await response.json();

    // Redirigir a Stripe Checkout
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Crea una sesión del portal de cliente de Stripe y redirige
 */
export async function redirectToCustomerPortal(): Promise<void> {
  try {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create portal session');
    }

    const { url } = await response.json();

    // Redirigir al portal de Stripe
    window.location.href = url;
  } catch (error) {
    console.error('Error redirecting to customer portal:', error);
    throw error;
  }
}
