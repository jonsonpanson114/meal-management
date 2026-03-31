const CACHE_NAME = 'mealtrack-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
      return cached || network;
    })
  );
});

// Notification handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icons/notification-icon.png',
      badge: '/icons/badge-72.png',
      vibrate: [200, 100, 200],
      tag: 'meal-reminder',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: '記録する',
        }
      ]
    });
  }

  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { mealType, time } = event.data;
    scheduleNotification(mealType, time);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/add')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Push event listener for background notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, body, icon, url, tag } = data;

    const options = {
      body: body || '食事を記録する時間です！',
      icon: icon || '/icons/notification-icon.png',
      badge: data.badge || '/icons/badge-72.png',
      vibrate: [200, 100, 200],
      tag: tag || 'meal-reminder',
      requireInteraction: true,
      data: { url: url || '/add' },
      actions: [
        {
          action: 'open',
          title: '記録する',
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title || 'MealTrack', options)
    );
  } catch (err) {
    console.error('Error handling push event:', err);
    // Generic fallback if JSON parsing fails
    event.waitUntil(
      self.registration.showNotification('MealTrack', {
        body: '食事の記録時間です。',
        icon: '/icons/icon-192.png?v=2',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with this URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
