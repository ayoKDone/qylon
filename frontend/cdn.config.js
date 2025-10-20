// CDN Configuration for Qylon Frontend
// This file contains CDN settings for production deployment

export const cdnConfig = {
  // CDN Base URLs (configure these for your CDN provider)
  baseUrl: process.env.VITE_CDN_BASE_URL || 'https://cdn.qylon.ai',

  // Asset paths
  assets: {
    js: '/assets/js',
    css: '/assets/css',
    images: '/assets/images',
    fonts: '/assets/fonts',
  },

  // Cache settings
  cache: {
    // Long-term cache for vendor chunks (1 year)
    vendor: {
      'react-vendor': '31536000', // 1 year
      'ui-vendor': '31536000',
      'utils-vendor': '31536000',
      'supabase-vendor': '31536000',
      'icons-vendor': '31536000',
    },
    // Medium-term cache for feature chunks (1 month)
    features: {
      auth: '2592000', // 30 days
      dashboard: '2592000',
      landing: '2592000',
    },
    // Short-term cache for main app (1 day)
    app: {
      index: '86400', // 1 day
    },
  },

  // Preload critical resources
  preload: {
    critical: ['react-vendor', 'ui-vendor', 'index'],
    // Preload on user interaction
    onHover: ['auth', 'dashboard'],
  },

  // Fallback URLs for CDN failures
  fallback: {
    enabled: true,
    timeout: 3000, // 3 seconds
    retryAttempts: 2,
  },
};

// CDN URL builder
export const buildCdnUrl = (path, version = 'latest') => {
  const baseUrl = cdnConfig.baseUrl;
  const versionedPath = version === 'latest' ? path : `${version}${path}`;
  return `${baseUrl}${versionedPath}`;
};

// Asset URL builder
export const getAssetUrl = (type, filename) => {
  const baseUrl = cdnConfig.baseUrl;
  const assetPath = cdnConfig.assets[type];
  return `${baseUrl}${assetPath}/${filename}`;
};

export default cdnConfig;
