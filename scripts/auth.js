// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Password strength checker
function checkPasswordStrength(password) {
  const strength = {
    score: 0,
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    isLongEnough: password.length >= 8,
  };

  if (strength.hasLowerCase) strength.score++;
  if (strength.hasUpperCase) strength.score++;
  if (strength.hasNumbers) strength.score++;
  if (strength.hasSpecialChar) strength.score++;
  if (strength.isLongEnough) strength.score++;

  return strength;
}

// Update password strength indicator
function updatePasswordStrength(password) {
  const strengthBar = document.querySelector(".strength-bar");
  const strengthText = document.querySelector(".strength-text");
  const strength = checkPasswordStrength(password);

  strengthBar.className = "strength-bar";
  strengthText.textContent = "Password strength";

  if (password.length === 0) {
    strengthText.textContent = "Password strength";
    return;
  }

  if (strength.score <= 2) {
    strengthBar.classList.add("weak");
    strengthText.textContent = "Weak password";
  } else if (strength.score <= 4) {
    strengthBar.classList.add("medium");
    strengthText.textContent = "Medium password";
  } else {
    strengthBar.classList.add("strong");
    strengthText.textContent = "Strong password";
  }
}

// Toggle password visibility
function togglePasswordVisibility(input, button) {
  const type = input.getAttribute("type") === "password" ? "text" : "password";
  input.setAttribute("type", type);
  button.querySelector("i").classList.toggle("fa-eye");
  button.querySelector("i").classList.toggle("fa-eye-slash");
}

// Validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Handle login form submission
function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("remember").checked;

  // Clear previous errors
  document.getElementById("emailError").textContent = "";
  document.getElementById("passwordError").textContent = "";

  // Validate email
  if (!validateEmail(email)) {
    document.getElementById("emailError").textContent =
      "Please enter a valid email address";
    return;
  }

  // Validate password
  if (password.length < 8) {
    document.getElementById("passwordError").textContent =
      "Password must be at least 8 characters long";
    return;
  }

  // Set persistence based on remember me
  auth
    .setPersistence(
      rememberMe
        ? firebase.auth.Auth.Persistence.LOCAL
        : firebase.auth.Auth.Persistence.SESSION
    )
    .then(() => {
      // Sign in user
      return auth.signInWithEmailAndPassword(email, password);
    })
    .then((userCredential) => {
      // Redirect to home page
      window.location.href = "/";
    })
    .catch((error) => {
      // Handle errors
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          document.getElementById("passwordError").textContent =
            "Invalid email or password";
          break;
        case "auth/too-many-requests":
          document.getElementById("passwordError").textContent =
            "Too many failed attempts. Please try again later";
          break;
        default:
          document.getElementById("passwordError").textContent =
            "An error occurred. Please try again";
      }
    });
}

// Handle signup form submission
function handleSignup(e) {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const terms = document.getElementById("terms").checked;

  // Clear previous errors
  document.getElementById("fullNameError").textContent = "";
  document.getElementById("emailError").textContent = "";
  document.getElementById("passwordError").textContent = "";
  document.getElementById("confirmPasswordError").textContent = "";

  // Validate full name
  if (fullName.length < 2) {
    document.getElementById("fullNameError").textContent =
      "Please enter your full name";
    return;
  }

  // Validate email
  if (!validateEmail(email)) {
    document.getElementById("emailError").textContent =
      "Please enter a valid email address";
    return;
  }

  // Validate password
  const passwordStrength = checkPasswordStrength(password);
  if (passwordStrength.score < 3) {
    document.getElementById("passwordError").textContent =
      "Password is too weak. Please use a stronger password";
    return;
  }

  // Validate confirm password
  if (password !== confirmPassword) {
    document.getElementById("confirmPasswordError").textContent =
      "Passwords do not match";
    return;
  }

  // Validate terms
  if (!terms) {
    document.getElementById("terms").focus();
    return;
  }

  // Create user
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Update user profile
      return userCredential.user.updateProfile({
        displayName: fullName,
      });
    })
    .then(() => {
      // Redirect to home page
      window.location.href = "/";
    })
    .catch((error) => {
      // Handle errors
      switch (error.code) {
        case "auth/email-already-in-use":
          document.getElementById("emailError").textContent =
            "Email is already in use";
          break;
        case "auth/invalid-email":
          document.getElementById("emailError").textContent =
            "Invalid email address";
          break;
        case "auth/operation-not-allowed":
          document.getElementById("emailError").textContent =
            "Email/password accounts are not enabled";
          break;
        case "auth/weak-password":
          document.getElementById("passwordError").textContent =
            "Password is too weak";
          break;
        default:
          document.getElementById("emailError").textContent =
            "An error occurred. Please try again";
      }
    });
}

// Initialize event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Password strength indicator
  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("input", (e) => {
      updatePasswordStrength(e.target.value);
    });
  }

  // Toggle password visibility
  document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.previousElementSibling;
      togglePasswordVisibility(input, button);
    });
  });

  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Signup form
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  // Check authentication state
  auth.onAuthStateChanged((user) => {
    if (user && window.location.pathname === "/login") {
      window.location.href = "/";
    }
  });
});
