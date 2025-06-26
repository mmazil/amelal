let allProducts = [];
let currentCategory = "Essentiels";
let shoppingList = [];
let currentProductIndex = null;

// Load shopping list from localStorage
function loadShoppingList() {
  const saved = localStorage.getItem('budgetPicksShoppingList');
  if (saved) {
    shoppingList = JSON.parse(saved);
    updateShoppingListDisplay();
  }
}

// Save shopping list to localStorage
function saveShoppingList() {
  localStorage.setItem('budgetPicksShoppingList', JSON.stringify(shoppingList));
}

// Parse price string to number
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  // Remove "MAD", "DH" and any non-numeric characters except decimal point
  const numStr = priceStr.replace(/[^\d.]/g, '');
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
  const existingIndex = shoppingList.findIndex(item => item.name === product.name);
  
  if (existingIndex >= 0) {
    // Increase quantity if already exists
    shoppingList[existingIndex].quantity += 1;
  } else {
    // Add new product with quantity 1
    shoppingList.push({
      ...product,
      quantity: 1,
      addedAt: new Date().toISOString()
    });
  }
  
  saveShoppingList();
  updateShoppingListDisplay();
  
  // Show success message
  showNotification('Product added to list! 🛒', 'success');
}

// Remove product from shopping list
function removeFromShoppingList(productName) {
  shoppingList = shoppingList.filter(item => item.name !== productName);
  saveShoppingList();
  updateShoppingListDisplay();
  showNotification('Product removed from list', 'info');
}

// Update quantity in shopping list
function updateQuantity(productName, newQuantity) {
  const item = shoppingList.find(item => item.name === productName);
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

// Calculate totals
function calculateTotals() {
  const subtotal = shoppingList.reduce((total, item) => {
    const price = parsePrice(item.price);
    return total + (price * item.quantity);
  }, 0);

  const totalSavings = shoppingList.reduce((total, item) => {
    const savings = parsePrice(item.saved || '0');
    return total + (savings * item.quantity);
  }, 0);

  const finalTotal = subtotal - totalSavings;

  return { subtotal, totalSavings, finalTotal };
}

// Update shopping list display
function updateShoppingListDisplay() {
  const listCount = document.getElementById('listCount');
  const totalItems = shoppingList.reduce((sum, item) => sum + item.quantity, 0);
  listCount.textContent = totalItems;
  
  const listItems = document.getElementById('shoppingListItems');
  const totalPriceEl = document.getElementById('totalPrice');
  const totalSavingsEl = document.getElementById('totalSavings');
  const finalTotalEl = document.getElementById('finalTotal');
  
  if (shoppingList.length === 0) {
    listItems.innerHTML = `
      <div class="text-center py-12">
        <div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"></path>
          </svg>
        </div>
        <p class="text-gray-500 text-lg font-medium">Your shopping list is empty</p>
        <p class="text-gray-400 text-sm">Add some products to get started!</p>
      </div>
    `;
  } else {
    listItems.innerHTML = shoppingList.map(item => `
      <div class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-elegant transition-all duration-200">
        <div class="flex items-center gap-4">
          <div class="relative">
            <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-contain rounded-lg bg-gray-50" />
            
          </div>
          
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-800 text-sm leading-tight mb-1">${item.name}</h4>
            <div class="flex items-center gap-3 mb-2">
              <span class="text-primary-600 font-bold text-lg">${item.price}</span>
              ${item.saved ? `<span class="text-green-600 font-medium text-sm">-${item.saved}</span>` : ''}
            </div>
            <div class="flex flex-wrap gap-1">
              ${item.category.map(cat => `
                <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">${cat}</span>
              `).join('')}
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
              <button onclick="updateQuantity('${item.name.replace(/'/g, "\\'")}', ${item.quantity - 1})" 
                      class="w-8 h-8 bg-white hover:bg-gray-100 rounded-md flex items-center justify-center text-gray-600 font-bold shadow-sm transition-colors duration-200">
                −
              </button>
              <span class="w-8 text-center font-semibold text-gray-800">${item.quantity}</span>
              <button onclick="updateQuantity('${item.name.replace(/'/g, "\\'")}', ${item.quantity + 1})" 
                      class="w-8 h-8 bg-white hover:bg-gray-100 rounded-md flex items-center justify-center text-gray-600 font-bold shadow-sm transition-colors duration-200">
                +
              </button>
            </div>
            
            <button onclick="removeFromShoppingList('${item.name.replace(/'/g, "\\'")}')" 
                    class="w-10 h-10 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // Update totals
  const { subtotal, totalSavings, finalTotal } = calculateTotals();
  totalPriceEl.textContent = formatPrice(subtotal);
  totalSavingsEl.textContent = formatPrice(totalSavings);
  finalTotalEl.textContent = formatPrice(finalTotal);
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  
  notification.className = `fixed top-24 right-6 z-50 px-6 py-4 rounded-xl text-white text-sm font-medium transition-all duration-300 transform translate-x-full shadow-elegant-lg ${bgColor}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.style.transform = 'translateX(0)', 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Render filtered products
function renderProducts(products = allProducts) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  const filteredProducts = products.filter((p) => p.category.includes(currentCategory));

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16">
        <div class="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-600 mb-2">No products found</h3>
        <p class="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    `;
    return;
  }

  filteredProducts.forEach((p, index) => {
    const originalIndex = allProducts.findIndex(product => product.name === p.name);
    grid.innerHTML += `
      <div class="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-elegant border border-gray-100 p-6 hover:shadow-elegant-lg hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1">
        <div class="flex flex-col lg:flex-row gap-6 h-full">
          <div class="relative">
            <img src="${p.image}" alt="${p.name}" class="w-32 h-32 lg:w-40 lg:h-40 object-contain rounded-xl bg-gray-50 mx-auto lg:mx-0" />
          </div>

          <div class="flex flex-col justify-between flex-1">
            <div class="space-y-3">
              <h3 class="text-xl font-bold text-gray-800 leading-tight group-hover:text-primary-700 transition-colors duration-200">${p.name}</h3>
              <p class="text-gray-600 text-sm leading-relaxed">${p.description}</p>

              <div class="flex flex-wrap gap-2">
                ${p.category.map(cat => `
                  <span class="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full font-medium">${cat}</span>
                `).join('')}
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-3">
                  <span class="text-2xl font-bold text-primary-600">${p.price}</span>
                  <div class="group/tooltip relative">
                    <svg class="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      This is the recommended price. Actual prices may vary by store.
                    </div>
                  </div>
                </div>

                ${p.saved ? `
                  <div class="flex items-center gap-3">
                    <span class="text-lg font-semibold text-green-600">You Save: ${p.saved}</span>
                    <div class="group/tooltip relative">
                      <svg class="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        Savings are calculated based on average market prices for similar products.
                      </div>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="pt-6 flex justify-end">
              <button onclick="openModal(${originalIndex})"
                class="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-semibold shadow-elegant transform hover:scale-105 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Product Details
              </button>
            </div>
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
          b.classList.remove("bg-gradient-to-r", "from-primary-500", "to-primary-600", "text-white", "shadow-elegant");
          b.classList.add("border-2", "border-gray-200", "text-gray-700");
        });
        
        btn.classList.remove("border-2", "border-gray-200", "text-gray-700");
        btn.classList.add("bg-gradient-to-r", "from-primary-500", "to-primary-600", "text-white", "shadow-elegant");
        
        currentCategory = btn.dataset.category;
        document.getElementById("searchInput").value = "";
        renderProducts();
      });
    });
  })
  .catch(error => {
    console.error('Error loading products:', error);
    showNotification('Error loading products. Please refresh the page.', 'error');
  });

// Open modal and show product details
window.openModal = function (index) {
  const product = allProducts[index];
  currentProductIndex = index;
  const modal = document.getElementById("modal");
  const productDetails = document.getElementById("productDetails");

  // Build product details HTML
  let detailsHTML = `
    <div class="flex flex-col lg:flex-row gap-6">
      <div class="relative lg:w-1/3">
        <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-contain rounded-xl bg-gray-50" />
        
      </div>
      
      <div class="lg:w-2/3 space-y-4">
        <div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">${product.name}</h3>
          <p class="text-gray-600 leading-relaxed">${product.description}</p>
        </div>
        
        <div class="flex flex-wrap gap-2">
          ${product.category.map(cat => `
            <span class="bg-primary-50 text-primary-700 text-sm px-3 py-2 rounded-full font-medium">${cat}</span>
          `).join('')}
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-xl border border-primary-200">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
          <span class="font-semibold text-primary-800">Price</span>
        </div>
        <p class="text-2xl font-bold text-primary-700">${product.price}</p>
      </div>
      
      ${product.saved ? `
        <div class="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="font-semibold text-green-800">You Save</span>
          </div>
          <p class="text-2xl font-bold text-green-700">${product.saved}</p>
        </div>
      ` : ''}
      
      ${product.volume ? `
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <span class="font-semibold text-gray-700">Volume</span>
          </div>
          <p class="text-lg font-bold text-gray-800">${product.volume}</p>
        </div>
      ` : ''}
      
      ${product.weight ? `
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
            </svg>
            <span class="font-semibold text-gray-700">Weight</span>
          </div>
          <p class="text-lg font-bold text-gray-800">${product.weight}</p>
        </div>
      ` : ''}
      
      ${product.quantity ? `
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
            </svg>
            <span class="font-semibold text-gray-700">Quantity</span>
          </div>
          <p class="text-lg font-bold text-gray-800">${product.quantity}</p>
        </div>
      ` : ''}
    </div>
  `;

  productDetails.innerHTML = detailsHTML;
  
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = 'hidden';
};

// Close modal
function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  document.getElementById("modal").classList.remove("flex");
  document.body.style.overflow = 'auto';
  currentProductIndex = null;
}

document.getElementById("closeModal").addEventListener("click", closeModal);

// Add to list button
document.getElementById("addToListBtn").addEventListener("click", () => {
  if (currentProductIndex !== null) {
    addToShoppingList(currentProductIndex);
    closeModal();
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
    showNotification('Shopping list cleared! 🗑️', 'info');
  }
});

// Search functionality
document.getElementById("searchInput").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = allProducts.filter(
    (p) =>
      p.category.includes(currentCategory) &&
      (p.name.toLowerCase().includes(keyword) || 
       p.description.toLowerCase().includes(keyword))
  );
  renderProducts(filtered);
});

// Close modal when clicking outside
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") {
    closeModal();
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});