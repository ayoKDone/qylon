// Critical Route Preloading System
// Intelligently preloads resources based on user behavior and critical paths

interface PreloadConfig {
  routes: {
    [key: string]: {
      priority: 'high' | 'medium' | 'low';
      preloadOn: 'hover' | 'click' | 'idle' | 'immediate';
      resources: string[];
    };
  };
  userBehavior: {
    trackHovers: boolean;
    trackClicks: boolean;
    idleTimeout: number;
  };
}

class RoutePreloader {
  private config: PreloadConfig;
  private preloadedRoutes: Set<string> = new Set();
  private userBehavior: Map<string, number> = new Map();

  constructor(config: PreloadConfig) {
    this.config = config;
    this.initializePreloading();
  }

  private initializePreloading(): void {
    // Preload critical routes immediately
    this.preloadCriticalRoutes();

    // Set up user behavior tracking
    if (this.config.userBehavior.trackHovers) {
      this.setupHoverTracking();
    }

    if (this.config.userBehavior.trackClicks) {
      this.setupClickTracking();
    }

    // Set up idle preloading
    this.setupIdlePreloading();
  }

  private preloadCriticalRoutes(): void {
    const criticalRoutes = Object.entries(this.config.routes)
      .filter(([, config]) => config.priority === 'high' && config.preloadOn === 'immediate')
      .map(([route]) => route);

    console.log('[Preloader] Preloading critical routes:', criticalRoutes);

    criticalRoutes.forEach(route => {
      this.preloadRoute(route);
    });
  }

  private setupHoverTracking(): void {
    document.addEventListener('mouseover', event => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;

      if (link) {
        const href = link.getAttribute('href');
        if (href && this.config.routes[href]) {
          const routeConfig = this.config.routes[href];
          if (routeConfig.preloadOn === 'hover') {
            this.preloadRoute(href);
          }
        }
      }
    });
  }

  private setupClickTracking(): void {
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;

      if (link) {
        const href = link.getAttribute('href');
        if (href && this.config.routes[href]) {
          const routeConfig = this.config.routes[href];
          if (routeConfig.preloadOn === 'click') {
            this.preloadRoute(href);
          }

          // Track user behavior
          this.trackUserBehavior(href);
        }
      }
    });
  }

  private setupIdlePreloading(): void {
    const preloadOnIdle = () => {
      const idleRoutes = Object.entries(this.config.routes)
        .filter(([, config]) => config.preloadOn === 'idle')
        .sort((a, b) => {
          const aScore = this.userBehavior.get(a[0]) || 0;
          const bScore = this.userBehavior.get(b[0]) || 0;
          return bScore - aScore; // Sort by user preference
        })
        .map(([route]) => route);

      console.log('[Preloader] Preloading routes on idle:', idleRoutes);

      idleRoutes.forEach(route => {
        if (!this.preloadedRoutes.has(route)) {
          this.preloadRoute(route);
        }
      });
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadOnIdle, { timeout: 5000 });
    } else {
      setTimeout(preloadOnIdle, 2000);
    }
  }

  private async preloadRoute(route: string): Promise<void> {
    if (this.preloadedRoutes.has(route)) {
      return;
    }

    const routeConfig = this.config.routes[route];
    if (!routeConfig) {
      return;
    }

    // Skip if no resources to preload (e.g., in development mode)
    if (routeConfig.resources.length === 0) {
      console.log('[Preloader] No resources to preload for route:', route);
      this.preloadedRoutes.add(route);
      return;
    }

    console.log('[Preloader] Preloading route:', route);

    try {
      // Preload route resources
      const preloadPromises = routeConfig.resources.map(resource => this.preloadResource(resource));

      await Promise.all(preloadPromises);
      this.preloadedRoutes.add(route);

      console.log('[Preloader] Route preloaded successfully:', route);
    } catch (error) {
      console.error('[Preloader] Failed to preload route:', route, error);
    }
  }

  private async preloadResource(resource: string): Promise<void> {
    try {
      if (resource.endsWith('.js')) {
        // Preload JavaScript chunks
        const link = document.createElement('link');
        link.rel = 'modulepreload';
        link.href = resource;
        document.head.appendChild(link);
      } else if (resource.endsWith('.css')) {
        // Preload CSS
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = resource;
        document.head.appendChild(link);
      } else if (this.isImageResource(resource)) {
        // Preload images
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = resource;
        document.head.appendChild(link);
      } else {
        // Generic preload
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        document.head.appendChild(link);
      }
    } catch (error) {
      console.error('[Preloader] Failed to preload resource:', resource, error);
    }
  }

  private isImageResource(resource: string): boolean {
    return /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(resource);
  }

  private trackUserBehavior(route: string): void {
    const currentScore = this.userBehavior.get(route) || 0;
    this.userBehavior.set(route, currentScore + 1);
  }

  // Public methods
  public async preloadRoutePublic(route: string): Promise<void> {
    return this.preloadRoute(route);
  }

  public isPreloaded(route: string): boolean {
    return this.preloadedRoutes.has(route);
  }

  public getPreloadedRoutes(): string[] {
    return Array.from(this.preloadedRoutes);
  }

  public getUserBehaviorStats(): Record<string, number> {
    return Object.fromEntries(this.userBehavior);
  }
}

// Resource hints for critical resources
export class ResourceHints {
  static addPreconnect(url: string): void {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  static addDnsPrefetch(url: string): void {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  static addPreload(resource: string, as: string, type?: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = as;
    if (type) {
      link.type = type;
    }
    document.head.appendChild(link);
  }

  static addPrefetch(resource: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = resource;
    document.head.appendChild(link);
  }
}

// Initialize preloader with Qylon-specific configuration
export const routePreloader = new RoutePreloader({
  routes: {
    '/dashboard': {
      priority: 'high',
      preloadOn: 'hover',
      resources: [
        ...(import.meta.env.PROD
          ? [
              '/assets/js/dashboard-[hash].js',
              '/assets/js/react-vendor-[hash].js',
              '/assets/js/ui-vendor-[hash].js',
            ]
          : []),
      ],
    },
    '/login': {
      priority: 'high',
      preloadOn: 'hover',
      resources: [
        // Only preload in production where hashed assets exist
        ...(import.meta.env.PROD
          ? ['/assets/js/auth-[hash].js', '/assets/js/react-vendor-[hash].js']
          : []),
      ],
    },
    '/signup': {
      priority: 'medium',
      preloadOn: 'hover',
      resources: [
        // Only preload in production where hashed assets exist
        ...(import.meta.env.PROD
          ? ['/assets/js/auth-[hash].js', '/assets/js/react-vendor-[hash].js']
          : []),
      ],
    },
    '/app': {
      priority: 'high',
      preloadOn: 'idle',
      resources: [
        // Only preload in production where hashed assets exist
        ...(import.meta.env.PROD
          ? [
              '/assets/js/AppUI-[hash].js',
              '/assets/js/react-vendor-[hash].js',
              '/assets/js/ui-vendor-[hash].js',
            ]
          : []),
      ],
    },
  },
  userBehavior: {
    trackHovers: true,
    trackClicks: true,
    idleTimeout: 2000,
  },
});

// Initialize resource hints for external domains
export function initializeResourceHints(): void {
  // Preconnect to external domains
  ResourceHints.addPreconnect('https://fonts.googleapis.com');
  ResourceHints.addPreconnect('https://fonts.gstatic.com');
  ResourceHints.addPreconnect('https://cdn.stylexui.com');

  // DNS prefetch for API domains
  ResourceHints.addDnsPrefetch('https://api.qylon.ai');
  ResourceHints.addDnsPrefetch('https://supabase.co');

  // Preload critical fonts
  ResourceHints.addPreload(
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
    'style',
  );
}

export default RoutePreloader;