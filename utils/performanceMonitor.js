const { performanceConfig } = require("../config/optimization");

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.thresholds = performanceConfig.thresholds;
    this.monitoringInterval = performanceConfig.monitoring.interval;
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    if (typeof window === "undefined") return;

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();

    // Monitor resource loading
    this.monitorResourceLoading();

    // Monitor custom metrics
    this.monitorCustomMetrics();
  }

  /**
   * Monitor Core Web Vitals
   */
  monitorCoreWebVitals() {
    // First Contentful Paint (FCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcp = entries[entries.length - 1];
      this.metrics.fcp = fcp.startTime;
      this.checkThreshold("fcp", fcp.startTime);
    }).observe({ entryTypes: ["paint"] });

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lcp = entries[entries.length - 1];
      this.metrics.lcp = lcp.startTime;
      this.checkThreshold("lcp", lcp.startTime);
    }).observe({ entryTypes: ["largest-contentful-paint"] });

    // Time to Interactive (TTI)
    this.monitorTTI();
  }

  /**
   * Monitor Time to Interactive
   */
  monitorTTI() {
    let tti = null;
    const checkTTI = () => {
      const timing = performance.timing;
      if (timing.domInteractive && timing.domContentLoadedEventEnd) {
        tti = timing.domInteractive - timing.domContentLoadedEventEnd;
        this.metrics.tti = tti;
        this.checkThreshold("tti", tti);
      }
    };

    window.addEventListener("load", checkTTI);
  }

  /**
   * Monitor resource loading
   */
  monitorResourceLoading() {
    const resources = performance.getEntriesByType("resource");
    this.metrics.resources = resources.map((resource) => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize,
    }));
  }

  /**
   * Monitor custom metrics
   */
  monitorCustomMetrics() {
    setInterval(() => {
      // Monitor memory usage
      if (performance.memory) {
        this.metrics.memory = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
        };
      }

      // Monitor frame rate
      this.monitorFrameRate();
    }, this.monitoringInterval);
  }

  /**
   * Monitor frame rate
   */
  monitorFrameRate() {
    let lastTime = performance.now();
    let frames = 0;

    const checkFrameRate = () => {
      const currentTime = performance.now();
      frames++;

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        this.metrics.fps = fps;
        lastTime = currentTime;
        frames = 0;
      }

      requestAnimationFrame(checkFrameRate);
    };

    requestAnimationFrame(checkFrameRate);
  }

  /**
   * Check if metric exceeds threshold
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   */
  checkThreshold(metric, value) {
    if (value > this.thresholds[metric]) {
      console.warn(
        `Performance warning: ${metric} exceeded threshold (${value}ms)`
      );
      // You can add custom handling here, like sending to analytics
    }
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    return this.metrics;
  }
}

module.exports = new PerformanceMonitor();
