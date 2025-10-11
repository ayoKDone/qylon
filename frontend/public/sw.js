// Qylon Service Worker - Advanced Caching Strategy
// Version: 1.0.0

const CACHE_NAME = 'qylon-v1.0.0';
const STATIC_CACHE = 'qylon-static-v1.0.0';
const DYNAMIC_CACHE = 'qylon-dynamic-v1.0.0';
const API_CACHE = 'qylon-api-v1.0.0';

// Cache strategies
const CACHE_STRATEGIES = {
    // Cache first for static assets
    CACHE_FIRST: 'cache-first',
    // Network first for API calls
    NETWORK_FIRST: 'network-first',
    // Stale while revalidate for dynamic content
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
    // Network only for critical requests
    NETWORK_ONLY: 'network-only'
};

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico'
];

// Vendor chunks (long-term cache)
const VENDOR_CHUNKS = [
    'react-vendor',
    'ui-vendor',
    'utils-vendor',
    'supabase-vendor',
    'icons-vendor'
];

// Feature chunks (medium-term cache)
const FEATURE_CHUNKS = [
    'auth',
    'dashboard',
    'landing'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE &&
                            cacheName !== DYNAMIC_CACHE &&
                            cacheName !== API_CACHE) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Determine caching strategy based on request type
    if (isStaticAsset(request)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (isVendorChunk(request)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE, 31536000)); // 1 year
    } else if (isFeatureChunk(request)) {
        event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE, 2592000)); // 30 days
    } else if (isApiRequest(request)) {
        event.respondWith(networkFirst(request, API_CACHE, 300)); // 5 minutes
    } else if (isImageRequest(request)) {
        event.respondWith(cacheFirst(request, DYNAMIC_CACHE, 86400)); // 1 day
    } else {
        event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE, 3600)); // 1 hour
    }
});

// Cache First Strategy
async function cacheFirst(request, cacheName, maxAge = 86400) {
    try {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            // Check if cache is still valid
            const cacheTime = cachedResponse.headers.get('sw-cache-time');
            if (cacheTime && (Date.now() - parseInt(cacheTime)) < maxAge * 1000) {
                console.log('[SW] Serving from cache:', request.url);
                return cachedResponse;
            }
        }

        // Fetch from network
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            const responseToCache = networkResponse.clone();
            // Create new response with additional headers instead of modifying immutable headers
            const newHeaders = new Headers(responseToCache.headers);
            newHeaders.set('sw-cache-time', Date.now().toString());
            const responseWithCacheTime = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: newHeaders
            });
            cache.put(request, responseWithCacheTime);
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache first failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Network First Strategy
async function networkFirst(request, cacheName, maxAge = 300) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            const responseToCache = networkResponse.clone();
            // Create new response with additional headers instead of modifying immutable headers
            const newHeaders = new Headers(responseToCache.headers);
            newHeaders.set('sw-cache-time', Date.now().toString());
            const responseWithCacheTime = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: newHeaders
            });
            cache.put(request, responseWithCacheTime);
        }

        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            const cacheTime = cachedResponse.headers.get('sw-cache-time');
            if (cacheTime && (Date.now() - parseInt(cacheTime)) < maxAge * 1000) {
                return cachedResponse;
            }
        }

        return new Response('Offline', { status: 503 });
    }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName, maxAge = 3600) {
    const cachedResponse = await caches.match(request);

    // Update cache in background
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            const cache = caches.open(cacheName);
            const responseToCache = networkResponse.clone();
            // Create new response with additional headers instead of modifying immutable headers
            const newHeaders = new Headers(responseToCache.headers);
            newHeaders.set('sw-cache-time', Date.now().toString());
            const responseWithCacheTime = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: newHeaders
            });
            cache.then(c => c.put(request, responseWithCacheTime));
        }
        return networkResponse;
    });

    // Return cached version immediately if available and fresh
    if (cachedResponse) {
        const cacheTime = cachedResponse.headers.get('sw-cache-time');
        if (cacheTime && (Date.now() - parseInt(cacheTime)) < maxAge * 1000) {
            console.log('[SW] Serving stale while revalidating:', request.url);
            return cachedResponse;
        }
    }

    // Otherwise wait for network
    return fetchPromise;
}

// Helper functions
function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname === '/' ||
        url.pathname.endsWith('.html') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.json');
}

function isVendorChunk(request) {
    const url = new URL(request.url);
    return VENDOR_CHUNKS.some(chunk => url.pathname.includes(chunk));
}

function isFeatureChunk(request) {
    const url = new URL(request.url);
    return FEATURE_CHUNKS.some(chunk => url.pathname.includes(chunk));
}

function isApiRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') ||
        url.hostname.includes('supabase') ||
        url.hostname.includes('api.');
}

function isImageRequest(request) {
    const url = new URL(request.url);
    return /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(url.pathname);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    console.log('[SW] Performing background sync...');
    // Implement background sync logic here
}

// Push notifications
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            }
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        self.clients.openWindow('/')
    );
});

console.log('[SW] Service worker script loaded');
