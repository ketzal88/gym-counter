import { db } from '@/lib/firebase-admin';

/**
 * Ventana fija por clave, compartida entre instancias serverless (Firestore `rateLimits`, server-only).
 * Devuelve true si la request entra en el cupo. La clave no puede contener '/'.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const ref = db.collection('rateLimits').doc(key);
  return db.runTransaction(async (tx) => {
    const now = Date.now();
    const data = (await tx.get(ref)).data() as { windowStart: number; count: number } | undefined;
    if (!data || now - data.windowStart >= windowMs) {
      tx.set(ref, { windowStart: now, count: 1 });
      return true;
    }
    if (data.count >= limit) return false;
    tx.update(ref, { count: data.count + 1 });
    return true;
  });
}

export const tooManyRequests = { message: 'Too many requests' };
