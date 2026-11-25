import type Stripe from 'stripe';

/** Estado de Stripe → subscriptionStatus de users/{uid}. past_due/unpaid/incomplete/paused quedan como 'cancelled' (comportamiento previo). */
export function mapStatus(status: Stripe.Subscription.Status): 'trial' | 'active' | 'cancelled' {
  if (status === 'trialing') return 'trial';
  if (status === 'active') return 'active';
  return 'cancelled';
}

/** Stripe puede mandar el id o el objeto expandido; null en sesiones que no son de suscripción. */
export function idOf(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === 'string' ? ref : ref.id;
}

/** Período actual (ms) del primer item, o null si la suscripción no trae items. */
export function currentPeriod(sub: Stripe.Subscription): { startMs: number; endMs: number } | null {
  const item = sub.items?.data?.[0];
  if (!item) return null;
  return { startMs: item.current_period_start * 1000, endMs: item.current_period_end * 1000 };
}
