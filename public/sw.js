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
      icon: icon || '/icons/icon-192.png?v=2',
      badge: '/icons/icon-192.png?v=2',
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

function scheduleNotification(mealType, time) {
  // Calculate delay until next meal time
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (scheduledTime < now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delay = scheduledTime.getTime() - now.getTime();

  // Schedule notification
  setTimeout(() => {
    const mealNames = {
      breakfast: '🍳 朝食',
      lunch: '🍱 昼食',
      dinner: '🍙 夕食'
    };

    self.registration.showNotification(`${mealNames[mealType]}の時間です！`, {
      body: '食事を記録してください',
      icon: '/icons/icon-192.png?v=2',
      badge: '/icons/icon-192.png?v=2',
      vibrate: [200, 100, 200],
      tag: `meal-${mealType}`,
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: '記録する',
        }
      ]
    });
  }, delay);
}
