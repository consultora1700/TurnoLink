// TLink Service Worker v3 — push notifications only (no caching)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: '/icons/icon-192x192.png?v=tlink-1',
      badge: '/icons/badge-96x96.png?v=tlink-1',
      data: { url: data.url || '/turnos' },
      vibrate: [200, 100, 200],
      tag: data.tag || 'tlink',
      renotify: true,
      actions: getActionsForTag(data.tag),
    };
    event.waitUntil(self.registration.showNotification(data.title || 'TLink', options));
  } catch (e) {
    event.waitUntil(
      self.registration.showNotification('TLink', {
        body: event.data.text(),
        icon: '/icons/icon-192x192.png?v=tlink-1',
        badge: '/icons/badge-96x96.png?v=tlink-1',
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
