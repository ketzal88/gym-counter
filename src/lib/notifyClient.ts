import { auth } from '@/lib/firebase';

function fireAndForget(type: string, payload: Record<string, unknown>, withAuth = false) {
  (async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      if (withAuth && auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch('/api/notify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ type, payload }),
      });
    } catch {
      // Silent fail — notification is best-effort
    }
  })();
}

export function reportNewUser(email: string, name: string, method: string) {
  fireAndForget('new_user', { email, name, method });
}

export function reportError(source: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  fireAndForget('error', { source, message, stack });
}

export function submitFeedback(message: string) {
  fireAndForget('feedback', { message }, true);
}
