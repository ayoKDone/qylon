// Performance Monitoring System
// Tracks Core Web Vitals, custom metrics, and performance analytics

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: string;
}

// interface CoreWebVitals {
//   CLS: number; // Cumulative Layout Shift
//   FID: number; // First Input Delay
//   FCP: number; // First Contentful Paint
//   LCP: number; // Largest Contentful Paint
//   TTFB: number; // Time to First Byte
// }

interface PerformanceConfig {
  apiEndpoint: string;
  sampleRate: number; // 0-1, percentage of users to monitor
  batchSize: number;
  flushInterval: number; // milliseconds
  enableRealUserMonitoring: boolean;
  enableSyntheticMonitoring: boolean;
}

class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private flushTimer: number | null = null;
  private observer: PerformanceObserver | null = null;

  constructor(config: PerformanceConfig) {
    this.config = config;
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    // Check if user should be monitored (sampling)
    if (Math.random() > this.config.sampleRate) {
      console.log('[Performance] User not selected for monitoring');
      return;
    }

    console.log('[Performance] Initializing performance monitoring...');

    // Initialize Core Web Vitals monitoring
    this.initializeCoreWebVitals();

    // Initialize custom metrics
    this.initializeCustomMetrics();

    // Initialize navigation timing
    this.initializeNavigationTiming();

    // Initialize resource timing
    this.initializeResourceTiming();

    // Start batch flushing
    this.startBatchFlushing();

    // Monitor page visibility changes
    this.initializeVisibilityMonitoring();
  }

  private initializeCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    this.observeLCP();

    // First Input Delay (FID)
    this.observeFID();

    // Cumulative Layout Shift (CLS)
    this.observeCLS();

    // First Contentful Paint (FCP)
    this.observeFCP();
  }

  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;

        this.recordMetric('LCP', lastEntry.startTime);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.error('[Performance] Failed to observe LCP:', error);
    }
  }

  private observeFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEventTiming) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.error('[Performance] Failed to observe FID:', error);
    }
  }

  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: PerformanceEntry[] = [];

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry) => {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            if (
              sessionValue &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000
            ) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
              sessionEntries = [entry];
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue;
            }
          }
        });

        this.recordMetric('CLS', clsValue);
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.error('[Performance] Failed to observe CLS:', error);
    }
  }

  private observeFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordMetric('FCP', entry.startTime);
        });
      });

      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.error('[Performance] Failed to observe FCP:', error);
    }
  }

  private initializeCustomMetrics(): void {
    // Time to Interactive (TTI) approximation
    this.measureTTI();

    // Bundle load times
    this.measureBundleLoadTimes();

    // Route transition times
    this.measureRouteTransitions();
  }

  private measureTTI(): void {
    // Approximate TTI as when the page becomes interactive
    const startTime = performance.now();

    const checkTTI = () => {
      if (document.readyState === 'complete') {
        const tti = performance.now() - startTime;
        this.recordMetric('TTI', tti);
      } else {
        setTimeout(checkTTI, 100);
      }
    };

    checkTTI();
  }

  private measureBundleLoadTimes(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceResourceTiming) => {
          if (entry.initiatorType === 'script' || entry.initiatorType === 'link') {
            const loadTime = entry.responseEnd - entry.startTime;
            this.recordMetric(`Bundle-${entry.name.split('/').pop()}`, loadTime);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.error('[Performance] Failed to observe bundle load times:', error);
    }
  }

  private measureRouteTransitions(): void {
    let routeStartTime = 0;

    // Track route start
    window.addEventListener('beforeunload', () => {
      routeStartTime = performance.now();
    });

    // Track route end
    window.addEventListener('load', () => {
      if (routeStartTime > 0) {
        const routeTime = performance.now() - routeStartTime;
        this.recordMetric('RouteTransition', routeTime);
      }
    });
  }

  private initializeNavigationTiming(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          this.recordMetric('TTFB', navigation.responseStart - navigation.requestStart);
          this.recordMetric(
            'DOMContentLoaded',
            navigation.domContentLoadedEventEnd - navigation.fetchStart,
          );
          this.recordMetric('LoadComplete', navigation.loadEventEnd - navigation.fetchStart);
        }
      }, 0);
    });
  }

  private initializeResourceTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceResourceTiming) => {
          // Track slow resources
          const loadTime = entry.responseEnd - entry.startTime;
          if (loadTime > 1000) {
            // Resources taking more than 1 second
            this.recordMetric(`SlowResource-${entry.name}`, loadTime);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.error('[Performance] Failed to observe resource timing:', error);
    }
  }

  private initializeVisibilityMonitoring(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushMetrics();
      }
    });

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushMetrics();
    });
  }

  private recordMetric(name: string, value: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType,
    };

    this.metrics.push(metric);
    console.log(`[Performance] ${name}: ${value}ms`);

    // Flush if batch is full
    if (this.metrics.length >= this.config.batchSize) {
      this.flushMetrics();
    }
  }

  private startBatchFlushing(): void {
    this.flushTimer = window.setInterval(() => {
      if (this.metrics.length > 0) {
        this.flushMetrics();
      }
    }, this.config.flushInterval);
  }

  private async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    try {
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metricsToSend,
          timestamp: Date.now(),
          sessionId: this.getSessionId(),
        }),
      });

      console.log(`[Performance] Sent ${metricsToSend.length} metrics`);
    } catch (error) {
      console.error('[Performance] Failed to send metrics:', error);
      // Re-add metrics to queue for retry
      this.metrics.unshift(...metricsToSend);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('performance-session-id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('performance-session-id', sessionId);
    }
    return sessionId;
  }

  // Public methods
  public recordCustomMetric(name: string, value: number): void {
    this.recordMetric(name, value);
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public flush(): Promise<void> {
    return this.flushMetrics();
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Performance dashboard utilities
export class PerformanceDashboard {
  private static instance: PerformanceDashboard;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceDashboard {
    if (!PerformanceDashboard.instance) {
      PerformanceDashboard.instance = new PerformanceDashboard();
    }
    return PerformanceDashboard.instance;
  }

  addMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getMetricStats(name: string): { avg: number; min: number; max: number; count: number } {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { avg, min, max, count: values.length };
  }

  getAllStats(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const stats: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    for (const [name] of this.metrics) {
      stats[name] = this.getMetricStats(name);
    }

    return stats;
  }

  exportData(): string {
    return JSON.stringify(this.getAllStats(), null, 2);
  }
}

// Initialize performance monitor only in production
export const performanceMonitor = import.meta.env.PROD
  ? new PerformanceMonitor({
      apiEndpoint: '/api/performance/metrics',
      sampleRate: 0.1, // Monitor 10% of users
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      enableRealUserMonitoring: true,
      enableSyntheticMonitoring: false,
    })
  : null;

export default PerformanceMonitor;
