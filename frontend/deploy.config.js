// Deployment Configuration for Qylon Frontend
// Contains settings for CDN deployment and production optimization

export const deployConfig = {
  // CDN Configuration
  cdn: {
    provider: 'cloudflare', // or 'aws-cloudfront', 'azure-cdn', etc.
    baseUrl: 'https://cdn.qylon.ai',
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
    cacheControl: {
      static: 'public, max-age=31536000, immutable', // 1 year
      dynamic: 'public, max-age=3600, s-maxage=86400', // 1 hour browser, 1 day CDN
      api: 'public, max-age=300, s-maxage=1800', // 5 minutes browser, 30 minutes CDN
    },
  },

  // Build Configuration
  build: {
    minify: true,
    sourcemap: false,
    compress: true,
    treeShake: true,
    bundleAnalyzer: false,
  },

  // Performance Configuration
  performance: {
    enableServiceWorker: true,
    enablePreloading: true,
    enableMonitoring: true,
    sampleRate: 0.1, // Monitor 10% of users
    criticalResourceHints: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.stylexui.com',
    ],
  },

  // Security Configuration
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableCORS: true,
    allowedOrigins: ['https://qylon.ai', 'https://app.qylon.ai', 'https://api.qylon.ai'],
  },

  // Environment Configuration
  environments: {
    development: {
      cdn: false,
      monitoring: false,
      serviceWorker: false,
    },
    staging: {
      cdn: true,
      monitoring: true,
      serviceWorker: true,
      sampleRate: 0.5,
    },
    production: {
      cdn: true,
      monitoring: true,
      serviceWorker: true,
      sampleRate: 0.1,
    },
  },
};

// Deployment scripts
export const deploymentScripts = {
  // Build for production
  build: () => {
    console.log('Building for production...');
    // Add build commands here
  },

  // Deploy to CDN
  deploy: (environment = 'production') => {
    const config = deployConfig.environments[environment];
    console.log(`Deploying to ${environment}...`, config);
    // Add deployment commands here
  },

  // Invalidate CDN cache
  invalidate: (paths = ['/*']) => {
    console.log('Invalidating CDN cache for paths:', paths);
    // Add cache invalidation commands here
  },

  // Run performance tests
  test: () => {
    console.log('Running performance tests...');
    // Add performance testing commands here
  },
};

export default deployConfig;
