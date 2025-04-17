// Cart Management Module
const CartManager = {
  // Initialize cart
  init() {
    this.loadCart();
    this.updateCartCount();
  },

  // Load cart from localStorage
  loadCart() {
    const cartData = localStorage.getItem("cart");
    this.cart = cartData ? JSON.parse(cartData) : [];
  },

  // Save cart to localStorage
  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
  },

  // Add item to cart
  addItem(product) {
    // Validate product data
    if (!this.validateProduct(product)) {
      return false;
    }

    // Check if product already exists in cart
    const existingItem = this.cart.find(
      (item) =>
        item.id === product.id &&
        item.color === product.color &&
        item.size === product.size
    );

    if (existingItem) {
      // Update quantity if product exists
      existingItem.quantity += product.quantity;
    } else {
      // Add new item to cart
      this.cart.push({
        ...product,
        timestamp: Date.now(),
      });
    }

    // Save and update UI
    this.saveCart();
    this.updateCartCount();
    return true;
  },

  // Remove item from cart
  removeItem(productId, color, size) {
    this.cart = this.cart.filter(
      (item) =>
        !(item.id === productId && item.color === color && item.size === size)
    );
    this.saveCart();
    this.updateCartCount();
  },

  // Update item quantity
  updateQuantity(productId, color, size, newQuantity) {
    const item = this.cart.find(
      (item) =>
        item.id === productId && item.color === color && item.size === size
    );

    if (item) {
      item.quantity = Math.max(1, newQuantity);
      this.saveCart();
      this.updateCartCount();
    }
  },

  // Get cart count
  getCartCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  },

  // Update cart count in UI
  updateCartCount() {
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) {
      const count = this.getCartCount();
      cartCount.textContent = count;
      cartCount.classList.add("update");
      setTimeout(() => cartCount.classList.remove("update"), 500);
    }
  },

  // Validate product data
  validateProduct(product) {
    return (
      product.id &&
      product.name &&
      product.price > 0 &&
      product.quantity > 0 &&
      product.color &&
      product.size
    );
  },

  // Get cart total
  getCartTotal() {
    return this.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },

  // Clear cart
  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartCount();
  },
};

// Initialize cart when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const cartManager = new CartManager();
  const cartItemsContainer = document.querySelector(".cart-items");
  const emptyCartMessage = document.querySelector(".empty-cart");
  const cartSummary = document.querySelector(".cart-summary");
  const checkoutBtn = document.querySelector(".checkout-btn");

  // Initialize cart display
  function initCart() {
    const cart = cartManager.loadCart();
    if (cart.length === 0) {
      showEmptyCart();
      return;
    }

    displayCartItems(cart);
    updateCartSummary(cart);
  }

  // Display cart items
  function displayCartItems(cart) {
    cartItemsContainer.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.id}" data-color="${
          item.color
        }" data-size="${item.size}">
        <img src="${item.image}" alt="${item.title}" class="cart-item-image">
        <div class="cart-item-details">
          <h3 class="cart-item-title">${item.title}</h3>
          <p class="cart-item-variants">Color: ${item.color} | Size: ${
          item.size
        }</p>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-selector">
            <button class="quantity-btn decrease">−</button>
            <input type="number" class="quantity-input" value="${
              item.quantity
            }" min="1">
            <button class="quantity-btn increase">+</button>
          </div>
          <button class="remove-item">
            <i class="fas fa-trash"></i>
            Remove
          </button>
        </div>
      </div>
    `
      )
      .join("");

    setupEventListeners();
  }

  // Update cart summary
  function updateCartSummary(cart) {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + shipping + tax;

    document.querySelector(
      ".summary-row.subtotal span"
    ).textContent = `$${subtotal.toFixed(2)}`;
    document.querySelector(
      ".summary-row.shipping span"
    ).textContent = `$${shipping.toFixed(2)}`;
    document.querySelector(
      ".summary-row.tax span"
    ).textContent = `$${tax.toFixed(2)}`;
    document.querySelector(
      ".summary-row.total span"
    ).textContent = `$${total.toFixed(2)}`;

    checkoutBtn.disabled = cart.length === 0;
  }

  // Show empty cart message
  function showEmptyCart() {
    cartItemsContainer.style.display = "none";
    cartSummary.style.display = "none";
    emptyCartMessage.style.display = "block";
  }

  // Setup event listeners
  function setupEventListeners() {
    // Quantity updates
    document.querySelectorAll(".quantity-btn").forEach((btn) => {
      btn.addEventListener("click", handleQuantityChange);
    });

    // Quantity input changes
    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("change", handleQuantityInput);
    });

    // Remove item
    document.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", handleRemoveItem);
    });
  }

  // Handle quantity button clicks
  function handleQuantityChange(e) {
    const item = e.target.closest(".cart-item");
    const input = item.querySelector(".quantity-input");
    const currentValue = parseInt(input.value);

    if (e.target.classList.contains("decrease")) {
      if (currentValue > 1) {
        input.value = currentValue - 1;
        updateItemQuantity(item);
      }
    } else if (e.target.classList.contains("increase")) {
      input.value = currentValue + 1;
      updateItemQuantity(item);
    }
  }

  // Handle quantity input changes
  function handleQuantityInput(e) {
    const input = e.target;
    const value = parseInt(input.value);

    if (value < 1) {
      input.value = 1;
    }

    updateItemQuantity(input.closest(".cart-item"));
  }

  // Update item quantity in cart
  function updateItemQuantity(item) {
    const id = item.dataset.id;
    const color = item.dataset.color;
    const size = item.dataset.size;
    const quantity = parseInt(item.querySelector(".quantity-input").value);

    cartManager.updateQuantity(id, color, size, quantity);
    const updatedCart = cartManager.loadCart();
    updateCartSummary(updatedCart);
  }

  // Handle item removal
  function handleRemoveItem(e) {
    const item = e.target.closest(".cart-item");
    const id = item.dataset.id;
    const color = item.dataset.color;
    const size = item.dataset.size;

    cartManager.removeItem(id, color, size);
    const updatedCart = cartManager.loadCart();

    if (updatedCart.length === 0) {
      showEmptyCart();
    } else {
      displayCartItems(updatedCart);
      updateCartSummary(updatedCart);
    }
  }

  // Initialize cart
  initCart();
});

// Export CartManager for use in other modules
window.CartManager = CartManager;
