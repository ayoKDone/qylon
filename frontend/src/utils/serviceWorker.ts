// Service Worker Registration and Management
// Handles service worker lifecycle and updates

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
}

class ServiceWorkerManager {
  private config: ServiceWorkerConfig;
  private registration: ServiceWorkerRegistration | null = null;

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = config;
  }

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service workers not supported');
      return null;
    }

    try {
      console.log('[SW] Registering service worker...');

      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[SW] Service worker registered successfully');

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available
                console.log('[SW] New content available');
                this.config.onUpdate?.(this.registration!);
              } else {
                // Content is cached for offline use
                console.log('[SW] Content cached for offline use');
                this.config.onOfflineReady?.();
              }
            }
          });
        }
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Service worker controller changed');
        window.location.reload();
      });

      this.config.onSuccess?.(this.registration);
      return this.registration;
    } catch (error) {
      console.error('[SW] Service worker registration failed:', error);
      return null;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('[SW] Service worker unregistered');
      return result;
    } catch (error) {
      console.error('[SW] Service worker unregistration failed:', error);
      return false;
    }
  }

  async update(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
      console.log('[SW] Service worker update triggered');
    } catch (error) {
      console.error('[SW] Service worker update failed:', error);
    }
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  isRegistered(): boolean {
    return this.registration !== null;
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

// Cache management utilities
export class CacheManager {
  static async clearAllCaches(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      console.log('[SW] All caches cleared');
    } catch (error) {
      console.error('[SW] Failed to clear caches:', error);
    }
  }

  static async getCacheSize(): Promise<number> {
    if (!('caches' in window)) {
      return 0;
    }

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();

        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('[SW] Failed to calculate cache size:', error);
      return 0;
    }
  }

  static async preloadCriticalResources(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    const criticalResources = ['/', '/index.html', '/manifest.json'];

    try {
      const cache = await caches.open('qylon-static-v1.0.0');
      await cache.addAll(criticalResources);
      console.log('[SW] Critical resources preloaded');
    } catch (error) {
      console.error('[SW] Failed to preload critical resources:', error);
    }
  }
}

// Performance monitoring for service worker
export class ServiceWorkerMetrics {
  private static instance: ServiceWorkerMetrics;
  private metrics: Map<string, number> = new Map();

  static getInstance(): ServiceWorkerMetrics {
    if (!ServiceWorkerMetrics.instance) {
      ServiceWorkerMetrics.instance = new ServiceWorkerMetrics();
    }
    return ServiceWorkerMetrics.instance;
  }

  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
    console.log(`[SW Metrics] ${name}: ${value}ms`);
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Export the main service worker manager
export const serviceWorkerManager = new ServiceWorkerManager({
  onUpdate: registration => {
    // Show update notification to user
    if (confirm('New version available! Reload to update?')) {
      window.location.reload();
    }
  },
  onSuccess: registration => {
    console.log('[SW] Service worker ready');
  },
  onOfflineReady: () => {
    console.log('[SW] App is ready for offline use');
  },
});

export default ServiceWorkerManager;
