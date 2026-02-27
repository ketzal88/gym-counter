import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function ensureInitialized() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

export const auth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    ensureInitialized();
    return (getAuth() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const db: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    ensureInitialized();
    return (getFirestore() as unknown as Record<string, unknown>)[prop as string];
  },
});
