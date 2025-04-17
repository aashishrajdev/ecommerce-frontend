const fs = require("fs");
const path = require("path");
const config = require("../build.config");
const { optimize } = require("./optimizer");
const { minify } = require("terser");
const CleanCSS = require("clean-css");
const { PurgeCSS } = require("purgecss");
const sharp = require("sharp");
const { performance } = require("perf_hooks");

class BuildOptimizer {
  constructor() {
    this.config = config;
    this.stats = {
      startTime: performance.now(),
      processedFiles: 0,
      totalSize: 0,
      optimizedSize: 0,
    };
  }

  async run() {
    console.log("Starting build optimization...");

    try {
      // Optimize JavaScript
      await this.optimizeJavaScript();

      // Optimize CSS
      await this.optimizeCSS();

      // Optimize Images
      await this.optimizeImages();

      // Generate resource hints
      await this.generateResourceHints();

      // Generate cache manifest
      await this.generateCacheManifest();

      this.printStats();
    } catch (error) {
      console.error("Build optimization failed:", error);
      process.exit(1);
    }
  }

  async optimizeJavaScript() {
    console.log("Optimizing JavaScript files...");

    const jsFiles = this.getFilesByExtension("js");
    for (const file of jsFiles) {
      const content = fs.readFileSync(file, "utf8");
      const result = await minify(content, {
        compress: true,
        mangle: true,
        sourceMap: this.config.optimization.js.sourceMaps,
      });

      const outputPath = this.getOutputPath(file);
      fs.writeFileSync(outputPath, result.code);
      if (result.map) {
        fs.writeFileSync(`${outputPath}.map`, result.map);
      }

      this.updateStats(file, content.length, result.code.length);
    }
  }

  async optimizeCSS() {
    console.log("Optimizing CSS files...");

    const cssFiles = this.getFilesByExtension("css");
    for (const file of cssFiles) {
      const content = fs.readFileSync(file, "utf8");

      // Purge unused CSS
      const purgeResult = await new PurgeCSS().purge({
        content: [this.getFilesByExtension("html")],
        css: [{ raw: content }],
      });

      // Minify CSS
      const minified = new CleanCSS({
        level: 2,
        sourceMap: this.config.optimization.css.sourceMaps,
      }).minify(purgeResult[0].css);

      const outputPath = this.getOutputPath(file);
      fs.writeFileSync(outputPath, minified.styles);
      if (minified.sourceMap) {
        fs.writeFileSync(`${outputPath}.map`, minified.sourceMap);
      }

      this.updateStats(file, content.length, minified.styles.length);
    }
  }

  async optimizeImages() {
    console.log("Optimizing images...");

    const imageFiles = this.getImageFiles();
    for (const file of imageFiles) {
      const image = sharp(file);
      const metadata = await image.metadata();

      // Generate different sizes
      for (const size of this.config.assets.images.sizes) {
        if (metadata.width > size) {
          const outputPath = this.getImageOutputPath(file, size);
          await image
            .resize(size)
            .toFormat("webp", { quality: this.config.assets.images.quality })
            .toFile(outputPath);
        }
      }

      this.updateStats(file, metadata.size, 0); // Actual size reduction calculated in sharp
    }
  }

  async generateResourceHints() {
    console.log("Generating resource hints...");

    const hints = [];

    // Add preload hints
    for (const resource of this.config.performance.preload) {
      hints.push(
        `<link rel="preload" href="${resource}" as="${this.getResourceType(
          resource
        )}">`
      );
    }

    // Add prefetch hints
    for (const resource of this.config.performance.prefetch) {
      hints.push(`<link rel="prefetch" href="${resource}">`);
    }

    // Add dns-prefetch hints
    const domains = this.getExternalDomains();
    for (const domain of domains) {
      hints.push(`<link rel="dns-prefetch" href="//${domain}">`);
    }

    fs.writeFileSync(
      path.join(this.config.paths.dist, "resource-hints.html"),
      hints.join("\n")
    );
  }

  async generateCacheManifest() {
    if (!this.config.performance.cache.enabled) return;

    console.log("Generating cache manifest...");

    const manifest = {
      version: Date.now(),
      resources: this.getAllResources(),
    };

    fs.writeFileSync(
      path.join(this.config.paths.dist, "cache.manifest"),
      JSON.stringify(manifest, null, 2)
    );
  }

  // Helper methods
  getFilesByExtension(ext) {
    return this.walkDir(this.config.paths.src).filter(
      (file) => path.extname(file) === `.${ext}`
    );
  }

  getImageFiles() {
    return this.walkDir(this.config.paths.src).filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
  }

  walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);

      if (stat && stat.isDirectory()) {
        results = results.concat(this.walkDir(file));
      } else {
        results.push(file);
      }
    });

    return results;
  }

  getOutputPath(file) {
    return path.join(
      this.config.paths.dist,
      path.relative(this.config.paths.src, file)
    );
  }

  getImageOutputPath(file, size) {
    const ext = path.extname(file);
    const basename = path.basename(file, ext);
    return path.join(
      this.config.paths.dist,
      this.config.assets.images.outputDir,
      `${basename}-${size}w.webp`
    );
  }

  getResourceType(resource) {
    const ext = path.extname(resource).toLowerCase();
    switch (ext) {
      case ".css":
        return "style";
      case ".js":
        return "script";
      case ".woff":
      case ".woff2":
        return "font";
      case ".png":
      case ".jpg":
      case ".jpeg":
      case ".gif":
      case ".webp":
        return "image";
      default:
        return "fetch";
    }
  }

  getExternalDomains() {
    const domains = new Set();
    const files = this.getFilesByExtension("html");

    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf8");
      const matches = content.match(/https?:\/\/([^\/"]+)/g);
      if (matches) {
        matches.forEach((match) => {
          const domain = match.split("/")[2];
          if (domain && !domain.includes("localhost")) {
            domains.add(domain);
          }
        });
      }
    });

    return Array.from(domains);
  }

  getAllResources() {
    const resources = [];

    // Add all files from dist directory
    this.walkDir(this.config.paths.dist).forEach((file) => {
      resources.push(path.relative(this.config.paths.dist, file));
    });

    return resources;
  }

  updateStats(file, originalSize, optimizedSize) {
    this.stats.processedFiles++;
    this.stats.totalSize += originalSize;
    this.stats.optimizedSize += optimizedSize || originalSize;
  }

  printStats() {
    const duration = (performance.now() - this.stats.startTime) / 1000;
    const savings =
      ((this.stats.totalSize - this.stats.optimizedSize) /
        this.stats.totalSize) *
      100;

    console.log("\nBuild Optimization Complete!");
    console.log("---------------------------");
    console.log(`Processed Files: ${this.stats.processedFiles}`);
    console.log(
      `Original Size: ${(this.stats.totalSize / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(
      `Optimized Size: ${(this.stats.optimizedSize / 1024 / 1024).toFixed(
        2
      )} MB`
    );
    console.log(`Savings: ${savings.toFixed(2)}%`);
    console.log(`Duration: ${duration.toFixed(2)}s`);
  }
}

// Run the build optimizer
new BuildOptimizer().run().catch(console.error);
