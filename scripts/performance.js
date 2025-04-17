// Performance Optimizations
document.addEventListener("DOMContentLoaded", () => {
  // Initialize lazy loading
  initLazyLoading();

  // Initialize performance monitoring
  initPerformanceMonitoring();

  // Initialize resource hints
  initResourceHints();
});

// Lazy Loading Implementation
function initLazyLoading() {
  const lazyImages = document.querySelectorAll("img[data-src]");
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lazyImage = entry.target;
        lazyImage.src = lazyImage.dataset.src;
        lazyImage.classList.add("loaded");
        observer.unobserve(lazyImage);
      }
    });
  });

  lazyImages.forEach((image) => {
    imageObserver.observe(image);
  });
}

// Performance Monitoring
function initPerformanceMonitoring() {
  // Log performance metrics
  window.addEventListener("load", () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domLoadTime = perfData.domComplete - perfData.domLoading;

    console.log("Page Load Time:", pageLoadTime);
    console.log("DOM Load Time:", domLoadTime);

    // Send performance data to analytics if needed
    if (window.analytics) {
      window.analytics.track("Page Performance", {
        pageLoadTime,
        domLoadTime,
      });
    }
  });
}

// Resource Hints
function initResourceHints() {
  // Preconnect to important origins
  const preconnect = document.createElement("link");
  preconnect.rel = "preconnect";
  preconnect.href = "https://fonts.googleapis.com";
  document.head.appendChild(preconnect);

  // Prefetch important resources
  const prefetch = document.createElement("link");
  prefetch.rel = "prefetch";
  prefetch.href = "/styles/main.css";
  document.head.appendChild(prefetch);
}

// Cache Management
function clearOldCache() {
  if ("caches" in window) {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith("my-cache-")) {
            return caches.delete(cacheName);
          }
        })
      );
    });
  }
}

// Optimize Images
function optimizeImages() {
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    // Add loading="lazy" to images below the fold
    if (!isInViewport(img)) {
      img.loading = "lazy";
    }

    // Add width and height attributes if missing
    if (!img.hasAttribute("width") || !img.hasAttribute("height")) {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      img.setAttribute("width", width);
      img.setAttribute("height", height);
    }
  });
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Optimize Animations
function optimizeAnimations() {
  // Use requestAnimationFrame for smooth animations
  function animate() {
    // Animation logic here
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// Optimize Event Listeners
function optimizeEventListeners() {
  // Use passive event listeners for better scrolling performance
  document.addEventListener("touchstart", () => {}, { passive: true });
  document.addEventListener("scroll", () => {}, { passive: true });
}

// Initialize all optimizations
function initOptimizations() {
  optimizeImages();
  optimizeAnimations();
  optimizeEventListeners();
  clearOldCache();
}

// Run optimizations after page load
window.addEventListener("load", initOptimizations);
