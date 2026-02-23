// TurnoLink Service Worker — push notifications only (no caching)

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-96x96.png',
      data: { url: data.url || '/turnos' },
      vibrate: [200, 100, 200],
      tag: data.tag || 'turnolink',
      renotify: true,
      actions: getActionsForTag(data.tag),
    };
    event.waitUntil(self.registration.showNotification(data.title || 'TurnoLink', options));
  } catch (e) {
    // Fallback for non-JSON payloads
    event.waitUntil(
      self.registration.showNotification('TurnoLink', {
        body: event.data.text(),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-96x96.png',
      }),
    );
  }
});

function getActionsForTag(tag) {
  switch (tag) {
    case 'new-booking':
      return [
        { action: 'view', title: 'Ver turno' },
        { action: 'dismiss', title: 'Cerrar' },
      ];
    case 'cancellation':
      return [
        { action: 'view', title: 'Ver detalles' },
        { action: 'dismiss', title: 'Cerrar' },
      ];
    case 'reminder':
      return [
        { action: 'view', title: 'Ver agenda' },
      ];
    default:
      return [];
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Handle action buttons
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/turnos';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    }),
  );
});
