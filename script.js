let allProducts = [];
let currentCategory = "Essentiels";
let shoppingList = [];
let currentProductIndex = null;

// Load shopping list from localStorage
function loadShoppingList() {
  const saved = localStorage.getItem("budgetPicksShoppingList");
  if (saved) {
    shoppingList = JSON.parse(saved);
    updateShoppingListDisplay();
  }
}

// Save shopping list to localStorage
function saveShoppingList() {
  localStorage.setItem("budgetPicksShoppingList", JSON.stringify(shoppingList));
}

// Parse price string to number
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  // Remove "MAD", "DH" and any non-numeric characters except decimal point
  const numStr = priceStr.replace(/[^\d.]/g, "");
  return parseFloat(numStr) || 0;
}

// Format price for display
function formatPrice(price) {
  return `${price.toFixed(2)} MAD`;
}

// Add product to shopping list
function addToShoppingList(productIndex) {
  const product = allProducts[productIndex];

  // Check if product already exists in list
  const existingIndex = shoppingList.findIndex(
    (item) => item.name === product.name
  );

  if (existingIndex >= 0) {
    // Increase quantity if already exists
    shoppingList[existingIndex].quantity += 1;
  } else {
    // Add new product with quantity 1
    shoppingList.push({
      ...product,
      quantity: 1,
      addedAt: new Date().toISOString(),
    });
  }

  saveShoppingList();
  updateShoppingListDisplay();

  // Show success message
  showNotification("Product added to list!", "success");
}

// Remove product from shopping list
function removeFromShoppingList(productName) {
  shoppingList = shoppingList.filter((item) => item.name !== productName);
  saveShoppingList();
  updateShoppingListDisplay();
  showNotification("Product removed from list!", "info");
}

// Update quantity in shopping list
function updateQuantity(productName, newQuantity) {
  const item = shoppingList.find((item) => item.name === productName);
  if (item) {
    if (newQuantity <= 0) {
      removeFromShoppingList(productName);
    } else {
      item.quantity = newQuantity;
      saveShoppingList();
      updateShoppingListDisplay();
    }
  }
}

// Calculate total price
function calculateTotal() {
  return shoppingList.reduce((total, item) => {
    const price = parsePrice(item.price);
    return total + price * item.quantity;
  }, 0);
}

// Update shopping list display
function updateShoppingListDisplay() {
  const listCount = document.getElementById("listCount");
  const totalItems = shoppingList.reduce((sum, item) => sum + item.quantity, 0);
  listCount.textContent = totalItems;

  const listItems = document.getElementById("shoppingListItems");
  const totalPrice = document.getElementById("totalPrice");

  if (shoppingList.length === 0) {
    listItems.innerHTML =
      '<p class="text-gray-500 text-center py-4">Your shopping list is empty</p>';
  } else {
    listItems.innerHTML = shoppingList
      .map(
        (item) => `
      <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
        <img src="${item.image}" alt="${
          item.name
        }" class="w-16 h-16 object-contain rounded" />
        <div class="flex-1">
          <h4 class="font-medium text-sm">${item.name}</h4>
          <p class="text-indigo-600 font-semibold text-sm">${item.price}</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="updateQuantity('${item.name.replace(
            /'/g,
            "\\'"
          )}', ${item.quantity - 1})" 
                  class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
            -
          </button>
          <span class="w-8 text-center font-medium">${item.quantity}</span>
          <button onclick="updateQuantity('${item.name.replace(
            /'/g,
            "\\'"
          )}', ${item.quantity + 1})" 
                  class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
            +
          </button>
        </div>
        <button onclick="removeFromShoppingList('${item.name.replace(
          /'/g,
          "\\'"
        )}')" 
                class="text-red-500 hover:text-red-700 p-1">
          🗑️
        </button>
      </div>
    `
      )
      .join("");
  }

  totalPrice.textContent = formatPrice(calculateTotal());
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `fixed top-20 right-4 z-50 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500"
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => (notification.style.transform = "translateX(0)"), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

// Render filtered products
function renderProducts(products = allProducts) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  products
    .filter((p) => p.category.includes(currentCategory))
    .forEach((p, index) => {
      grid.innerHTML += `
      <div class="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition flex flex-col md:flex-row gap-4 h-full">
        <img src="${p.image}" alt="${
        p.name
      }" class="w-32 h-32 object-contain rounded-md" />

        <div class="flex flex-col justify-between flex-1">
          <div class="space-y-2">
            <h3 class="text-lg font-semibold">${p.name}</h3>
            <p class="text-sm text-gray-600">${p.description}</p>

            <!-- Price + Info Icon -->
            <div class="flex items-center gap-2">
              <p class="text-indigo-600 font-bold text-sm">Price: ${p.price}</p>
              <span class="text-gray-400 text-sm cursor-pointer group relative">
                ℹ️
                <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-60 bg-gray-800 text-white text-md rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                  This is the recommended price, prices may vary by supermarket.
                </span>
              </span>
            </div>

            ${
              p.saved
                ? `
                <div class="flex items-center gap-2">
                <p class="text-green-600 font-medium text-sm">You Save: ${p.saved}</p>
                <span class="text-gray-400 text-sm cursor-pointer group relative">
                ℹ️
                <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-60 bg-gray-800 text-white text-md rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                  Your savings are averaged based on prices of similar products.
                </span>
              </span></div>`
                : ""
            }
          </div>

          <div class="pt-4 justify-end flex">
            <button onclick="openModal(${index})"
              class="bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700 transition whitespace-nowrap">
              Product Details
            </button>
          </div>
        </div>
      </div>
    `;
    });
}

// Fetch products and setup filters
fetch("products.json")
  .then((res) => res.json())
  .then((products) => {
    allProducts = products;
    renderProducts();
    loadShoppingList();

    // Filter button logic
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach((b) => {
          b.classList.remove("bg-indigo-600", "text-white");
        });
        btn.classList.add("bg-indigo-600", "text-white");
        currentCategory = btn.dataset.category;
        document.getElementById("searchInput").value = ""; // clear search
        renderProducts();
      });
    });
  });

// Open modal and show product details
window.openModal = function (index) {
  const product = allProducts[index];
  currentProductIndex = index;
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const productDetails = document.getElementById("productDetails");

  modalTitle.textContent = "Product Details";

  // Build product details HTML
  let detailsHTML = `
    <div class="flex gap-4">
      <img src="${product.image}" alt="${
    product.name
  }" class="w-24 h-24 object-contain rounded-lg" />
      <div class="flex-1">
        <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
        <p class="text-sm text-gray-600 mb-2">${product.description}</p>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div class="bg-gray-50 p-3 rounded">
        <span class="font-medium text-gray-700">Price:</span>
        <p class="text-indigo-600 font-bold">${product.price}</p>
      </div>
      
      ${
        product.saved
          ? `
        <div class="bg-green-50 p-3 rounded">
          <span class="font-medium text-gray-700">You Save:</span>
          <p class="text-green-600 font-bold">${product.saved}</p>
        </div>
      `
          : ""
      }
      
      ${
        product.volume
          ? `
        <div class="bg-gray-50 p-3 rounded">
          <span class="font-medium text-gray-700">Volume:</span>
          <p class="font-semibold">${product.volume}</p>
        </div>
      `
          : ""
      }
      
      ${
        product.weight
          ? `
        <div class="bg-gray-50 p-3 rounded">
          <span class="font-medium text-gray-700">Weight:</span>
          <p class="font-semibold">${product.weight}</p>
        </div>
      `
          : ""
      }
      
      ${
        product.quantity
          ? `
        <div class="bg-gray-50 p-3 rounded">
          <span class="font-medium text-gray-700">Quantity:</span>
          <p class="font-semibold">${product.quantity}</p>
        </div>
      `
          : ""
      }
    </div>
    
    <div class="bg-gray-50 p-3 rounded">
      <span class="font-medium text-gray-700">Categories:</span>
      <div class="flex flex-wrap gap-1 mt-1">
        ${product.category
          .map(
            (cat) => `
          <span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">${cat}</span>
        `
          )
          .join("")}
      </div>
    </div>
  `;

  productDetails.innerHTML = detailsHTML;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

// Close modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
  currentProductIndex = null;
});

// Add to list button
document.getElementById("addToListBtn").addEventListener("click", () => {
  if (currentProductIndex !== null) {
    addToShoppingList(currentProductIndex);
    document.getElementById("modal").classList.add("hidden");
    currentProductIndex = null;
  }
});

// Toggle shopping list panel
document.getElementById("toggleListBtn").addEventListener("click", () => {
  const panel = document.getElementById("shoppingListPanel");
  panel.classList.toggle("hidden");
});

// Clear shopping list
document.getElementById("clearListBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear your shopping list?")) {
    shoppingList = [];
    saveShoppingList();
    updateShoppingListDisplay();
    showNotification("Shopping list cleared!", "info");
  }
});

// Search functionality scoped to current category
document.getElementById("searchInput").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = allProducts.filter(
    (p) =>
      p.category.includes(currentCategory) &&
      p.name.toLowerCase().includes(keyword)
  );
  renderProducts(filtered);
});

// Close modal when clicking outside
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") {
    document.getElementById("modal").classList.add("hidden");
    currentProductIndex = null;
  }
});
