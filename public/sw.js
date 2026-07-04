// Service worker mínimo de GymCounter.
// Su ÚNICO objetivo es habilitar notificaciones del sistema (registration.showNotification),
// necesarias en Android para el aviso de fin de descanso — que Wear OS espeja al reloj
// (ej. Google Pixel Watch) con vibración.
//
// A propósito NO tiene handler de `fetch` ni caché: no intercepta pedidos, así que no puede
// servir contenido viejo ni romper el modo online. Si más adelante se agrega offline real
// (p. ej. next-pwa/workbox), integrar esta lógica de notificaciones en ese SW.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Al tocar la notificación (en el teléfono o el reloj), enfocar/abrir la app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow('/dashboard');
        return undefined;
      })
  );
});
