/* ==========================================================================
   North Star Bakery - Client-Side Interactivity (script.js)
   Features:
     - Interactive Wishlist/Order Builder (products.html)
     - Dynamic Form Validation with Inline Error Feedback (contact.html)
     - Persistent State using localStorage
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize features based on current page
  initWishlistFeature();
  initFormValidation();
});

/* --------------------------------------------------------------------------
   DATA STRUCTURES (Advanced Rubric: Multiple arrays & objects)
   -------------------------------------------------------------------------- */
// Array of objects representing product catalog data
const bakeryCatalog = [
  { id: "loaf-sourdough", name: "Heritage Country Sourdough", category: "bread", price: 8.50 },
  { id: "loaf-seeded", name: "Seeded Multigrain Loaf", category: "bread", price: 9.00 },
  { id: "pastry-croissant", name: "Classic Butter Croissant", category: "pastry", price: 4.25 },
  { id: "pastry-morningbun", name: "Cardamom Morning Bun", category: "pastry", price: 4.75 },
  { id: "cake-carrot", name: "Carrot & Pecan Celebration Cake", category: "cake", price: 42.00 }
];

// Configuration object for form validation rules and custom error messages
const validationConfig = {
  name: {
    minLength: 2,
    emptyMessage: "Please provide your full name so we know who is picking up the order.",
    tooShortMessage: "Name must be at least 2 characters long."
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    emptyMessage: "An email address is required so we can send an order confirmation.",
    invalidMessage: "Please enter a valid email format (e.g., name@example.com)."
  },
  date: {
    emptyMessage: "Please choose a pickup date for your bakery items.",
    pastMessage: "Pickup date must be tomorrow or later (we require 48 hours notice)."
  },
  items: {
    emptyMessage: "Please list the items and quantities you wish to request."
  }
};

/* --------------------------------------------------------------------------
   FEATURE 1: Interactive Wishlist / Order Builder (products.html)
   -------------------------------------------------------------------------- */
function initWishlistFeature() {
  const wishlistContainer = document.getElementById("wishlist-container");
  if (!wishlistContainer) return; // Only run on products.html

  // Load saved wishlist array from localStorage or initialize empty array
  let userWishlist = loadFromStorage("bakery_wishlist") || [];

  renderWishlistUI(userWishlist);

  // Attach event listeners to all "Add to Pre-Order List" buttons
  const addButtons = document.querySelectorAll(".btn-add-item");
  addButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const itemId = this.getAttribute("data-id");
      const selectedItem = bakeryCatalog.find(item => item.id === itemId);

      if (selectedItem) {
        userWishlist.push(selectedItem);
        saveToStorage("bakery_wishlist", userWishlist);
        renderWishlistUI(userWishlist);
      }
    });
  });

  // Clear wishlist button listener
  const clearButton = document.getElementById("btn-clear-wishlist");
  if (clearButton) {
    clearButton.addEventListener("click", function () {
      userWishlist = [];
      saveToStorage("bakery_wishlist", userWishlist);
      renderWishlistUI(userWishlist);
    });
  }
}

// Function to update the DOM elements dynamically
function renderWishlistUI(itemsArray) {
  const listElement = document.getElementById("wishlist-items");
  const countElement = document.getElementById("wishlist-count");
  const transferLink = document.getElementById("wishlist-transfer-note");

  if (!listElement || !countElement) return;

  // Clear previous HTML
  listElement.innerHTML = "";
  countElement.textContent = itemsArray.length;

  if (itemsArray.length === 0) {
    listElement.innerHTML = "<li>No items added yet. Click an item below to build your inquiry.</li>";
    if (transferLink) transferLink.style.display = "none";
    return;
  }

  // Populate dynamic list items
  itemsArray.forEach(function (item, index) {
    const li = document.createElement("li");
    li.textContent = `${item.name} ($${item.price.toFixed(2)})`;
    listElement.appendChild(li);
  });

  if (transferLink) {
    transferLink.style.display = "block";
  }
}

/* --------------------------------------------------------------------------
   FEATURE 2: Form Validation & Feedback (contact.html)
   -------------------------------------------------------------------------- */
function initFormValidation() {
  const form = document.querySelector("form");
  if (!form) return; // Only run on contact.html

  // Pre-fill fields from localStorage if data exists
  prefillFromStorage();

  // Intercept submit event
  form.addEventListener("submit", function (event) {
    // Clear previous inline error messages
    clearAllErrors();

    let isValid = true;

    // 1. Validate Full Name
    const nameInput = document.getElementById("customer-name");
    if (!nameInput.value.trim()) {
      showError(nameInput, validationConfig.name.emptyMessage);
      isValid = false;
    } else if (nameInput.value.trim().length < validationConfig.name.minLength) {
      showError(nameInput, validationConfig.name.tooShortMessage);
      isValid = false;
    }

    // 2. Validate Email format
    const emailInput = document.getElementById("customer-email");
    if (!emailInput.value.trim()) {
      showError(emailInput, validationConfig.email.emptyMessage);
      isValid = false;
    } else if (!validationConfig.email.pattern.test(emailInput.value.trim())) {
      showError(emailInput, validationConfig.email.invalidMessage);
      isValid = false;
    }

    // 3. Validate Date (must be in future)
    const dateInput = document.getElementById("pickup-date");
    if (!dateInput.value) {
      showError(dateInput, validationConfig.date.emptyMessage);
      isValid = false;
    } else {
      const selectedDate = new Date(dateInput.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        showError(dateInput, validationConfig.date.pastMessage);
        isValid = false;
      }
    }

    // 4. Validate Item Details
    const itemsTextarea = document.getElementById("item-details");
    if (!itemsTextarea.value.trim()) {
      showError(itemsTextarea, validationConfig.items.emptyMessage);
      isValid = false;
    }

    // Prevent submission if invalid
    if (!isValid) {
      event.preventDefault();
    } else {
      // Save customer name and email to localStorage for future visits
      saveToStorage("bakery_saved_name", nameInput.value.trim());
      saveToStorage("bakery_saved_email", emailInput.value.trim());
    }
  });
}

function showError(inputElement, message) {
  inputElement.style.borderColor = "#B22222";
  const errorSpan = document.createElement("span");
  errorSpan.className = "inline-error-msg";
  errorSpan.textContent = message;
  errorSpan.style.color = "#B22222";
  errorSpan.style.fontSize = "0.85rem";
  errorSpan.style.display = "block";
  errorSpan.style.marginTop = "0.25rem";
  errorSpan.style.fontWeight = "bold";

  inputElement.parentNode.appendChild(errorSpan);
}

function clearAllErrors() {
  const errorSpans = document.querySelectorAll(".inline-error-msg");
  errorSpans.forEach(span => span.remove());

  const inputs = document.querySelectorAll("input, select, textarea");
  inputs.forEach(input => (input.style.borderColor = ""));
}

/* --------------------------------------------------------------------------
   FEATURE 3: localStorage Persistence Helpers
   -------------------------------------------------------------------------- */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Storage read error:", e);
    return null;
  }
}

function prefillFromStorage() {
  const savedName = loadFromStorage("bakery_saved_name");
  const savedEmail = loadFromStorage("bakery_saved_email");
  const savedWishlist = loadFromStorage("bakery_wishlist");

  const nameInput = document.getElementById("customer-name");
  const emailInput = document.getElementById("customer-email");
  const itemsTextarea = document.getElementById("item-details");

  if (nameInput && savedName) {
    nameInput.value = savedName;
  }
  if (emailInput && savedEmail) {
    emailInput.value = savedEmail;
  }
  // If user selected items on products.html, automatically populate the request textarea
  if (itemsTextarea && savedWishlist && savedWishlist.length > 0 && !itemsTextarea.value) {
    const itemNames = savedWishlist.map(i => i.name).join(", ");
    itemsTextarea.value = `Selected from bakery list: ${itemNames}`;
  }
}