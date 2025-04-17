const path = require("path");

module.exports = {
  // Input and output paths
  paths: {
    src: path.resolve(__dirname, "src"),
    dist: path.resolve(__dirname, "dist"),
    public: path.resolve(__dirname, "public"),
  },

  // Asset optimization settings
  assets: {
    // Image optimization
    images: {
      quality: 80,
      formats: ["webp", "avif"],
      sizes: [320, 640, 960, 1280, 1920],
      outputDir: "images",
    },

    // Font optimization
    fonts: {
      formats: ["woff2", "woff"],
      subset: true,
      outputDir: "fonts",
    },
  },

  // Build optimization settings
  optimization: {
    // JavaScript optimization
    js: {
      minify: true,
      sourceMaps: true,
      target: "es2015",
      treeShaking: true,
    },

    // CSS optimization
    css: {
      minify: true,
      sourceMaps: true,
      purge: true,
      autoprefixer: true,
    },

    // HTML optimization
    html: {
      minify: true,
      removeComments: true,
      collapseWhitespace: true,
    },
  },

  // Performance settings
  performance: {
    // Resource hints
    preload: ["/styles/main.css", "/scripts/main.js"],
    prefetch: ["/images/hero.webp", "/images/logo.svg"],

    // Cache settings
    cache: {
      enabled: true,
      maxAge: 31536000, // 1 year
      immutable: true,
    },

    // Compression settings
    compression: {
      enabled: true,
      algorithm: "brotli",
      level: 6,
    },
  },

  // Development settings
  dev: {
    port: 3000,
    host: "localhost",
    open: true,
    hot: true,
  },

  // Production settings
  prod: {
    minify: true,
    sourceMaps: false,
    analyze: true,
  },
};
