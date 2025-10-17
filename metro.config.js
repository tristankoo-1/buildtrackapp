// Learn more https://docs.expo.io/guides/customizing-metro
// Polyfill for Node.js < 18.14 where os.availableParallelism is missing
const os = require('os');
if (typeof os.availableParallelism !== 'function') {
  os.availableParallelism = () => {
    const cpus = os.cpus && os.cpus();
    return (cpus && cpus.length) || 1;
  };
}

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Note: Watchman is not installed, using Node.js file watcher
// This is fine for development - Metro will auto-detect the best option

// Configure for better hot reload
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Force reload headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return middleware(req, res, next);
    };
  },
};

// Enable transformer cache for faster rebuilds
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    // Keep for faster dev builds
    keep_classnames: true,
    keep_fnames: true,
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
