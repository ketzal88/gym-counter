import { auth } from '@/lib/firebase';

// /api/notify exige token: sin usuario logueado la notificación se descarta.
function fireAndForget(type: string, payload: Record<string, unknown>) {
  (async () => {
    try {
      if (!auth.currentUser) return;
      const token = await auth.currentUser.getIdToken();

      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type, payload }),
      });
    } catch {
      // Silent fail — notification is best-effort
    }
  })();
}

// El servidor toma email y método del token; no se mandan datos del usuario en el body.
export function reportNewUser() {
  fireAndForget('new_user', {});
}

export function reportError(source: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  fireAndForget('error', { source, message, stack });
}

export function submitFeedback(message: string) {
  fireAndForget('feedback', { message });
}
