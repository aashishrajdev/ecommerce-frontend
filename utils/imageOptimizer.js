const { imageConfig } = require("../config/optimization");

class ImageOptimizer {
  constructor() {
    this.supportedFormats = imageConfig.formats;
    this.breakpoints = imageConfig.breakpoints;
  }

  /**
   * Generate responsive image srcset
   * @param {string} imageUrl - Original image URL
   * @param {string} alt - Image alt text
   * @returns {string} - HTML img element with srcset
   */
  generateResponsiveImage(imageUrl, alt) {
    const srcset = Object.entries(this.breakpoints)
      .map(([size, width]) => {
        const optimizedUrl = this.getOptimizedImageUrl(imageUrl, width);
        return `${optimizedUrl} ${width}w`;
      })
      .join(", ");

    return `
      <img
        src="${this.getOptimizedImageUrl(imageUrl, this.breakpoints.medium)}"
        srcset="${srcset}"
        sizes="(max-width: ${this.breakpoints.small}px) ${
      this.breakpoints.small
    }px,
               (max-width: ${this.breakpoints.medium}px) ${
      this.breakpoints.medium
    }px,
               (max-width: ${this.breakpoints.large}px) ${
      this.breakpoints.large
    }px,
               ${this.breakpoints.xlarge}px"
        alt="${alt}"
        loading="lazy"
        width="${this.breakpoints.medium}"
        height="auto"
      />
    `;
  }

  /**
   * Get optimized image URL with CDN
   * @param {string} imageUrl - Original image URL
   * @param {number} width - Target width
   * @returns {string} - Optimized image URL
   */
  getOptimizedImageUrl(imageUrl, width) {
    const cdnBaseUrl = process.env.CDN_BASE_URL;
    const format = this.getBestFormat();

    return `${cdnBaseUrl}/images/${width}/${format}/${encodeURIComponent(
      imageUrl
    )}`;
  }

  /**
   * Determine best image format based on browser support
   * @returns {string} - Best supported format
   */
  getBestFormat() {
    // Check browser support for modern formats
    if (typeof window !== "undefined") {
      if (
        document
          .createElement("canvas")
          .toDataURL("image/avif")
          .indexOf("data:image/avif") === 0
      ) {
        return "avif";
      }
      if (
        document
          .createElement("canvas")
          .toDataURL("image/webp")
          .indexOf("data:image/webp") === 0
      ) {
        return "webp";
      }
    }
    return "jpg";
  }

  /**
   * Initialize lazy loading for images
   */
  initLazyLoading() {
    if (typeof window === "undefined") return;

    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add("loaded");
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: imageConfig.lazyLoading.rootMargin,
        threshold: imageConfig.lazyLoading.threshold,
      }
    );

    lazyImages.forEach((img) => imageObserver.observe(img));
  }
}

module.exports = new ImageOptimizer();
