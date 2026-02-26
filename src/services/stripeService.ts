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

    const { url } = await response.json();

    if (!url) {
      throw new Error('No checkout URL received');
    }

    // Redirigir a Stripe Checkout
    window.location.href = url;
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
