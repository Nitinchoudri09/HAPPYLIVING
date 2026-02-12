<<<<<<< HEAD
/* Service Worker for PWA Support */

const CACHE_NAME = 'happy-living-pg-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/student/dashboard.html',
  '/admin/dashboard.html',
  '/css/style.css',
  '/js/data.js',
  '/js/main.js',
  '/js/attendance.js',
  '/js/complaint.js',
  '/js/ai-service.js',
  '/js/auth-service.js',
  '/assets/hero_image.png',
  '/assets/pg_room.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - Network first, then cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncAttendance());
  }
  if (event.tag === 'sync-complaints') {
    event.waitUntil(syncComplaints());
  }
});

function syncAttendance() {
  // Sync attendance data when online
  const offlineAttendance = JSON.parse(localStorage.getItem('offline_attendance') || '[]');
  if (offlineAttendance.length > 0) {
    // In real app, send to server
    console.log('Syncing attendance:', offlineAttendance);
    localStorage.removeItem('offline_attendance');
  }
}

function syncComplaints() {
  // Sync complaints data when online
  const offlineComplaints = JSON.parse(localStorage.getItem('offline_complaints') || '[]');
  if (offlineComplaints.length > 0) {
    // In real app, send to server
    console.log('Syncing complaints:', offlineComplaints);
    localStorage.removeItem('offline_complaints');
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Happy Living PG';
  const options = {
    body: data.message || 'You have a new notification',
    icon: '/assets/hero_image.png',
    badge: '/assets/hero_image.png',
    tag: data.tag || 'notification',
    data: data
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/student/dashboard.html')
  );
});
=======
/* Service Worker for PWA Support */

const CACHE_NAME = 'happy-living-pg-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/student/dashboard.html',
  '/admin/dashboard.html',
  '/css/style.css',
  '/js/data.js',
  '/js/main.js',
  '/js/attendance.js',
  '/js/complaint.js',
  '/js/ai-service.js',
  '/js/auth-service.js',
  '/assets/hero_image.png',
  '/assets/pg_room.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - Network first, then cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncAttendance());
  }
  if (event.tag === 'sync-complaints') {
    event.waitUntil(syncComplaints());
  }
});

function syncAttendance() {
  // Sync attendance data when online
  const offlineAttendance = JSON.parse(localStorage.getItem('offline_attendance') || '[]');
  if (offlineAttendance.length > 0) {
    // In real app, send to server
    console.log('Syncing attendance:', offlineAttendance);
    localStorage.removeItem('offline_attendance');
  }
}

function syncComplaints() {
  // Sync complaints data when online
  const offlineComplaints = JSON.parse(localStorage.getItem('offline_complaints') || '[]');
  if (offlineComplaints.length > 0) {
    // In real app, send to server
    console.log('Syncing complaints:', offlineComplaints);
    localStorage.removeItem('offline_complaints');
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Happy Living PG';
  const options = {
    body: data.message || 'You have a new notification',
    icon: '/assets/hero_image.png',
    badge: '/assets/hero_image.png',
    tag: data.tag || 'notification',
    data: data
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/student/dashboard.html')
  );
});
>>>>>>> 31b055ca9899e947b1b40afacd65f81b8e93b160
