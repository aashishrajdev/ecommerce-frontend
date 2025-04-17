// Product Detail Page Functionality
document.addEventListener("DOMContentLoaded", () => {
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    // Redirect to home page if no product ID is provided
    window.location.href = "index.html";
    return;
  }

  // Fetch product data
  fetchProductData(productId);
  setupEventListeners();

  // Load cart data
  CartManager.init();
});

// Fetch product data from API
async function fetchProductData(productId) {
  try {
    // Show loading state
    document.querySelector(".product-detail").style.display = "none";
    document.querySelector(".loading").style.display = "block";

    // In a real application, this would be an API call
    // For now, we'll use mock data
    const mockProduct = {
      id: productId,
      title: "Premium Wireless Headphones",
      price: 299.99,
      description:
        "Experience crystal-clear sound with our premium wireless headphones. Featuring noise cancellation, 30-hour battery life, and comfortable over-ear design.",
      sku: "HP-2024-001",
      images: [
        "https://via.placeholder.com/800x800",
        "https://via.placeholder.com/800x800",
        "https://via.placeholder.com/800x800",
      ],
      variations: {
        colors: ["Black", "White", "Blue"],
        sizes: ["S", "M", "L"],
      },
      specifications: {
        Brand: "AudioPro",
        Model: "AP-2024",
        Connectivity: "Bluetooth 5.0",
        "Battery Life": "30 hours",
        "Charging Time": "2 hours",
        Weight: "250g",
      },
      reviews: [
        {
          author: "John Doe",
          date: "2024-02-15",
          rating: 5,
          content:
            "Amazing sound quality and very comfortable to wear for long periods.",
        },
        {
          author: "Jane Smith",
          date: "2024-02-10",
          rating: 4,
          content: "Great headphones, but the price is a bit high.",
        },
      ],
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Populate product data
    populateProductData(mockProduct);

    // Hide loading state
    document.querySelector(".loading").style.display = "none";
    document.querySelector(".product-detail").style.display = "grid";
  } catch (error) {
    console.error("Error fetching product data:", error);
    // Show error message
    document.querySelector(".loading").style.display = "none";
    document.querySelector(".error-message").style.display = "block";
  }
}

// Populate product data in the UI
function populateProductData(product) {
  // Set basic product info
  document.querySelector(".product-title").textContent = product.title;
  document.querySelector(
    ".product-price"
  ).textContent = `$${product.price.toFixed(2)}`;
  document.querySelector(".product-sku").textContent = `SKU: ${product.sku}`;
  document.querySelector(".product-description").textContent =
    product.description;

  // Set main product image
  const mainImage = document.querySelector(".main-image img");
  mainImage.src = product.images[0];
  mainImage.alt = product.title;

  // Populate thumbnail images
  const thumbnailContainer = document.querySelector(".thumbnail-images");
  thumbnailContainer.innerHTML = "";
  product.images.forEach((image, index) => {
    const thumbnail = document.createElement("img");
    thumbnail.src = image;
    thumbnail.alt = `${product.title} - Image ${index + 1}`;
    thumbnail.addEventListener("click", () => {
      mainImage.src = image;
    });
    thumbnailContainer.appendChild(thumbnail);
  });

  // Populate color options
  const colorOptions = document.querySelector(".color-options");
  colorOptions.innerHTML = "";
  product.variations.colors.forEach((color) => {
    const option = document.createElement("div");
    option.className = "color-option";
    option.textContent = color;
    option.addEventListener("click", () => {
      document
        .querySelectorAll(".color-option")
        .forEach((opt) => opt.classList.remove("selected"));
      option.classList.add("selected");
    });
    colorOptions.appendChild(option);
  });

  // Populate size options
  const sizeOptions = document.querySelector(".size-options");
  sizeOptions.innerHTML = "";
  product.variations.sizes.forEach((size) => {
    const option = document.createElement("div");
    option.className = "size-option";
    option.textContent = size;
    option.addEventListener("click", () => {
      document
        .querySelectorAll(".size-option")
        .forEach((opt) => opt.classList.remove("selected"));
      option.classList.add("selected");
    });
    sizeOptions.appendChild(option);
  });

  // Populate specifications
  const specificationsTable = document.querySelector(".specifications-table");
  specificationsTable.innerHTML = "";
  Object.entries(product.specifications).forEach(([key, value]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${key}</td>
            <td>${value}</td>
        `;
    specificationsTable.appendChild(row);
  });

  // Populate reviews
  const reviewsContainer = document.querySelector(".reviews-container");
  reviewsContainer.innerHTML = "";
  product.reviews.forEach((review) => {
    const reviewElement = document.createElement("div");
    reviewElement.className = "review";
    reviewElement.innerHTML = `
            <div class="review-header">
                <span class="review-author">${review.author}</span>
                <span class="review-date">${review.date}</span>
            </div>
            <div class="review-rating">
                ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}
            </div>
            <div class="review-content">${review.content}</div>
        `;
    reviewsContainer.appendChild(reviewElement);
  });
}

// Image Zoom Functionality
function setupImageZoom() {
  const mainImage = document.querySelector(".main-image img");
  const zoomLens = document.createElement("div");
  zoomLens.className = "zoom-lens";
  mainImage.parentElement.appendChild(zoomLens);

  const zoomResult = document.createElement("div");
  zoomResult.className = "zoom-result";
  mainImage.parentElement.appendChild(zoomResult);

  const zoomResultImg = document.createElement("img");
  zoomResult.appendChild(zoomResultImg);

  let isZooming = false;

  mainImage.addEventListener("mousemove", (e) => {
    if (!isZooming) return;

    const rect = mainImage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate lens position
    const lensX = x - zoomLens.offsetWidth / 2;
    const lensY = y - zoomLens.offsetHeight / 2;

    // Keep lens within image bounds
    const maxX = rect.width - zoomLens.offsetWidth;
    const maxY = rect.height - zoomLens.offsetHeight;

    zoomLens.style.left = `${Math.max(0, Math.min(lensX, maxX))}px`;
    zoomLens.style.top = `${Math.max(0, Math.min(lensY, maxY))}px`;

    // Calculate zoomed image position
    const scale = 2;
    const resultX = -(x * scale - zoomResult.offsetWidth / 2);
    const resultY = -(y * scale - zoomResult.offsetHeight / 2);

    zoomResultImg.style.left = `${resultX}px`;
    zoomResultImg.style.top = `${resultY}px`;
  });

  mainImage.addEventListener("mouseenter", () => {
    if (window.innerWidth <= 768) return;
    isZooming = true;
    zoomLens.style.display = "block";
    zoomResult.style.display = "block";
    zoomResultImg.src = mainImage.src;
  });

  mainImage.addEventListener("mouseleave", () => {
    isZooming = false;
    zoomLens.style.display = "none";
    zoomResult.style.display = "none";
  });
}

// Dynamic Price Updates
function updatePrice() {
  const basePrice = parseFloat(
    document.querySelector(".product-price").dataset.basePrice
  );
  const quantity = parseInt(document.getElementById("quantity").value);
  const selectedColor = document.querySelector(".color-option.selected");
  const selectedSize = document.querySelector(".size-option.selected");

  let finalPrice = basePrice;

  // Apply color premium if selected
  if (selectedColor) {
    const colorPremium = parseFloat(selectedColor.dataset.premium || 0);
    finalPrice += colorPremium;
  }

  // Apply size premium if selected
  if (selectedSize) {
    const sizePremium = parseFloat(selectedSize.dataset.premium || 0);
    finalPrice += sizePremium;
  }

  // Calculate total
  const totalPrice = finalPrice * quantity;

  // Update price display with animation
  const priceElement = document.querySelector(".product-price");
  priceElement.textContent = `$${totalPrice.toFixed(2)}`;
  priceElement.classList.add("price-update");
  setTimeout(() => priceElement.classList.remove("price-update"), 500);
}

// Add to cart functionality
function handleAddToCart() {
  const selectedColor = document.querySelector(".color-option.selected");
  const selectedSize = document.querySelector(".size-option.selected");
  const quantity = parseInt(document.getElementById("quantity").value);
  const productId = new URLSearchParams(window.location.search).get("id");
  const productTitle = document.querySelector(".product-title").textContent;
  const productPrice = parseFloat(
    document.querySelector(".product-price").textContent.replace("$", "")
  );
  const productImage = document.querySelector(".main-image img").src;

  // Validate selections
  if (!selectedColor || !selectedSize) {
    showError("Please select both color and size before adding to cart.");
    return;
  }

  // Prepare product data
  const product = {
    id: productId,
    name: productTitle,
    price: productPrice,
    image: productImage,
    color: selectedColor.textContent,
    size: selectedSize.textContent,
    quantity: quantity,
  };

  // Add to cart
  if (CartManager.addItem(product)) {
    showSuccessMessage();
    animateAddToCart();
  } else {
    showError("Failed to add item to cart. Please try again.");
  }
}

// Show success message
function showSuccessMessage() {
  const message = document.createElement("div");
  message.className = "success-message";
  message.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Item added to cart successfully!</span>
    `;
  document.body.appendChild(message);

  // Show message
  setTimeout(() => message.classList.add("show"), 100);

  // Remove message after 3 seconds
  setTimeout(() => {
    message.classList.remove("show");
    setTimeout(() => message.remove(), 300);
  }, 3000);
}

// Show error message
function showError(message) {
  const error = document.createElement("div");
  error.className = "error-message";
  error.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
  document.body.appendChild(error);

  // Show error
  setTimeout(() => error.classList.add("show"), 100);

  // Remove error after 3 seconds
  setTimeout(() => {
    error.classList.remove("show");
    setTimeout(() => error.remove(), 300);
  }, 3000);
}

// Animate add to cart
function animateAddToCart() {
  const addToCartBtn = document.querySelector(".add-to-cart-btn");
  const cartIcon = document.querySelector(".cart-link i");

  // Add ripple effect
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  addToCartBtn.appendChild(ripple);

  // Remove ripple after animation
  setTimeout(() => ripple.remove(), 600);

  // Animate cart icon
  cartIcon.classList.add("animate");
  setTimeout(() => cartIcon.classList.remove("animate"), 1000);
}

// Setup event listeners
function setupEventListeners() {
  // Tab switching
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");

      // Update active tab button
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Show target tab pane
      tabPanes.forEach((pane) => {
        pane.classList.remove("active");
        if (pane.id === targetId) {
          pane.classList.add("active");
        }
      });
    });
  });

  // Quantity selector
  const quantityInput = document.getElementById("quantity");
  const decreaseBtn = document.querySelector(".quantity-btn.decrease");
  const increaseBtn = document.querySelector(".quantity-btn.increase");

  decreaseBtn.addEventListener("click", () => {
    let value = parseInt(quantityInput.value);
    if (value > 1) {
      quantityInput.value = value - 1;
    }
  });

  increaseBtn.addEventListener("click", () => {
    let value = parseInt(quantityInput.value);
    quantityInput.value = value + 1;
  });

  // Add to cart button
  const addToCartBtn = document.querySelector(".add-to-cart-btn");
  addToCartBtn.addEventListener("click", handleAddToCart);

  // Quantity input validation
  quantityInput.addEventListener("change", () => {
    let value = parseInt(quantityInput.value);
    if (isNaN(value) || value < 1) {
      quantityInput.value = 1;
    }
    updatePrice();
  });

  // Wishlist button
  const wishlistBtn = document.querySelector(".wishlist-btn");
  wishlistBtn.addEventListener("click", () => {
    // In a real application, this would toggle the wishlist status
    console.log("Toggling wishlist status");
    wishlistBtn.classList.toggle("active");
  });

  // Share button
  const shareBtn = document.querySelector(".share-btn");
  shareBtn.addEventListener("click", () => {
    // In a real application, this would open a share dialog
    console.log("Sharing product");
    alert("Share functionality would be implemented here.");
  });
}
