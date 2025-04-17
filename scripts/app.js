console.log("E-Commerce Website Loaded");

document.addEventListener("DOMContentLoaded", () => {
  // Select elements
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const mainNav = document.querySelector(".main-nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const productsGrid = document.getElementById("productsGrid");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortSelect = document.getElementById("sortSelect");
  const quickViewModal = document.getElementById("quickViewModal");
  const closeModal = document.querySelector(".close-modal");
  const modalProductImage = document.getElementById("modalProductImage");
  const modalProductTitle = document.getElementById("modalProductTitle");
  const modalProductPrice = document.getElementById("modalProductPrice");
  const modalProductDescription = document.getElementById(
    "modalProductDescription"
  );
  const modalViewDetails = document.getElementById("modalViewDetails");
  const modalAddToCart = document.getElementById("modalAddToCart");

  // Cache for storing API responses
  const cache = {
    products: null,
    lastFetch: null,
    cacheDuration: 5 * 60 * 1000, // 5 minutes
  };

  let products = [];
  let filteredProducts = [];

  // Toggle mobile menu
  hamburgerMenu.addEventListener("click", () => {
    mainNav.classList.toggle("active");
    hamburgerMenu.classList.toggle("active");
  });

  // Close mobile menu when clicking a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("active");
      hamburgerMenu.classList.remove("active");
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!mainNav.contains(e.target) && !hamburgerMenu.contains(e.target)) {
      mainNav.classList.remove("active");
      hamburgerMenu.classList.remove("active");
    }
  });

  // Handle window resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768) {
        mainNav.classList.remove("active");
        hamburgerMenu.classList.remove("active");
      }
    }, 250);
  });

  // Show loading state
  function showLoadingState() {
    productsGrid.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading products...</p>
      </div>
    `;
  }

  // Show error state
  function showErrorState(message) {
    productsGrid.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <button class="retry-button" onclick="fetchProducts()">Try Again</button>
      </div>
    `;
  }

  // Fetch and display products
  async function fetchProducts() {
    showLoadingState();

    // Check cache first
    if (
      cache.products &&
      cache.lastFetch &&
      Date.now() - cache.lastFetch < cache.cacheDuration
    ) {
      products = cache.products;
      filteredProducts = [...products];
      displayProducts(filteredProducts);
      return;
    }

    try {
      const response = await fetch("https://fakestoreapi.com/products");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      products = await response.json();

      // Update cache
      cache.products = products;
      cache.lastFetch = Date.now();

      filteredProducts = [...products];
      displayProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      showErrorState(
        "Failed to load products. Please check your internet connection and try again."
      );
    }
  }

  function displayProducts(productsToDisplay) {
    if (productsToDisplay.length === 0) {
      productsGrid.innerHTML = `
        <div class="no-products">
          <p>No products found matching your criteria.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = productsToDisplay
      .map(
        (product) => `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          <img 
            src="${product.image}" 
            alt="${product.title}" 
            loading="lazy"
            onerror="this.src='assets/placeholder-image.jpg'"
          >
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <div class="product-rating">
            <span class="rating-stars">
              ${generateStarRating(product.rating.rate)}
            </span>
            <span class="rating-count">(${product.rating.count})</span>
          </div>
          <p class="product-price">$${product.price.toFixed(2)}</p>
          <button class="add-to-cart" data-product-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
    `
      )
      .join("");

    // Add event listeners to product cards and buttons
    document.querySelectorAll(".product-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (!e.target.classList.contains("add-to-cart")) {
          const productId = card.dataset.productId;
          const product = products.find((p) => p.id == productId);
          showQuickView(product);
        }
      });
    });

    document.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        addToCart(e);
      });
    });
  }

  function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return `
      ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
      ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ""}
      ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
    `;
  }

  function showQuickView(product) {
    modalProductImage.src = product.image;
    modalProductImage.alt = product.title;
    modalProductTitle.textContent = product.title;
    modalProductPrice.textContent = `$${product.price.toFixed(2)}`;
    modalProductDescription.textContent = product.description;
    modalViewDetails.href = `/product/${product.id}`;
    modalAddToCart.dataset.productId = product.id;

    quickViewModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeQuickView() {
    quickViewModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Close modal when clicking outside
  quickViewModal.addEventListener("click", (e) => {
    if (e.target === quickViewModal) {
      closeQuickView();
    }
  });

  closeModal.addEventListener("click", closeQuickView);

  // Handle category filtering
  categoryFilter.addEventListener("change", () => {
    const category = categoryFilter.value;
    filteredProducts = category
      ? products.filter((product) => product.category === category)
      : [...products];
    sortProducts();
  });

  // Handle sorting
  sortSelect.addEventListener("change", sortProducts);

  function sortProducts() {
    const sortBy = sortSelect.value;
    let sortedProducts = [...filteredProducts];

    switch (sortBy) {
      case "price-asc":
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sortedProducts.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
      default:
        // Default sorting (by ID)
        sortedProducts.sort((a, b) => a.id - b.id);
    }

    displayProducts(sortedProducts);
  }

  function addToCart(event) {
    const productId = event.target.dataset.productId;
    const cartCount = document.querySelector(".cart-count");
    let currentCount = parseInt(cartCount.textContent);
    cartCount.textContent = currentCount + 1;

    // Add animation to cart icon
    const cartIcon = document.querySelector(".cart-link i");
    cartIcon.classList.add("animate");
    setTimeout(() => cartIcon.classList.remove("animate"), 1000);

    // Close quick view if open
    if (quickViewModal.classList.contains("active")) {
      closeQuickView();
    }
  }

  // Initialize product fetching
  fetchProducts();
});
