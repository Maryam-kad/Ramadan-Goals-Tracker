const CACHE = 'ramadan-goals-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  if (e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          const fetchPromise = fetch(e.request).then(response => {
            cache.put(e.request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
  }
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIF') {
    const { title, body, delay } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="#0d1b2a"/><path d="M140 96.79A49 49 0 1 1 91.21 48 38.1 38.1 0 0 0 140 96.79z" fill="#d4a842"/></svg>'),
        badge: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="M70 48.4A24.5 24.5 0 1 1 45.6 24 19 19 0 0 0 70 48.4z" fill="#d4a842"/></svg>'),
        vibrate: [200, 100, 200],
        tag: title,
        requireInteraction: true,
      });
    }, delay || 0);
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Ramadan Goals', body: 'Check your goals!' };
  e.waitUntil(self.registration.showNotification(data.title, { body: data.body }));
});
