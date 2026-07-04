/**
 * Notificaciones del timer de descanso.
 *
 * En Android, `new Notification()` está bloqueado: hay que usar el service worker
 * (`ServiceWorkerRegistration.showNotification`). Wear OS espeja automáticamente la
 * notificación del teléfono al reloj (ej. Google Pixel Watch), con vibración —
 * así sentís el fin del descanso en la muñeca sin tocar el teléfono.
 */

export function notificationsSupported(): boolean {
    return (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        'serviceWorker' in navigator
    );
}

/** Pide permiso de notificaciones si aún no se decidió. Devuelve true si quedó concedido. */
export async function ensureNotificationPermission(): Promise<boolean> {
    if (!notificationsSupported()) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    try {
        return (await Notification.requestPermission()) === 'granted';
    } catch {
        return false;
    }
}

/** Dispara la notificación de "descanso terminado" (llega al reloj vía el teléfono). */
export async function notifyRestOver(): Promise<void> {
    if (!notificationsSupported() || Notification.permission !== 'granted') return;
    try {
        const registration = await navigator.serviceWorker.ready;
        // `vibrate`/`renotify` son válidos en la spec pero no siempre están en los tipos DOM.
        const options = {
            body: 'Dale a la próxima serie.',
            tag: 'gymcounter-rest',
            renotify: true,
            icon: '/icon-192.png',
            badge: '/favicon-32.png',
            vibrate: [300, 120, 300],
            silent: false,
        } as unknown as NotificationOptions;
        await registration.showNotification('¡Descanso terminado! 💪', options);
    } catch {
        /* notificación no disponible — ignorar silenciosamente */
    }
}
