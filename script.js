let allProducts = [];
let allPromotions = [];
let filteredProducts = [];
let currentCategory = "Promotions";
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
  // Remove "MAD", "DH" and any non-numeric characters except decimal point and comma
  const numStr = priceStr.replace(/[^\d.,]/g, "").replace(",", ".");
  return parseFloat(numStr) || 0;
}

// Format price for display
function formatPrice(price) {
  return `${price.toFixed(2).replace(".", ",")} MAD`;
}

// Check if promotion is still valid
function isPromotionValid(promotionEnd) {
  if (!promotionEnd) return true;
  const endDate = new Date(promotionEnd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  return endDate >= today;
}

// Format promotion date for display
function formatPromotionDate(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  // If start and end dates are the same, show only one date
  if (startDate === endDate) {
    return `le ${start.toLocaleDateString("fr-FR", options)}`;
  } else {
    // If different, show both dates
    return `du ${start.toLocaleDateString(
      "fr-FR",
      options
    )} au ${end.toLocaleDateString("fr-FR", options)}`;
  }
}

// Add product to shopping list
function addToShoppingList(product) {
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
  showNotification("Produit ajouté à la liste !", "success");
}

// Remove product from shopping list
function removeFromShoppingList(productName) {
  shoppingList = shoppingList.filter((item) => item.name !== productName);
  saveShoppingList();
  updateShoppingListDisplay();
  showNotification("Produit retiré de la liste !", "info");
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

// Calculate total savings
function calculateTotalSavings() {
  return shoppingList.reduce((total, item) => {
    const savings = parsePrice(item.saved || "0");
    return total + savings * item.quantity;
  }, 0);
}

// Update shopping list display
function updateShoppingListDisplay() {
  const listCount = document.getElementById("listCount");
  const totalItems = shoppingList.reduce((sum, item) => sum + item.quantity, 0);
  listCount.textContent = totalItems;

  const listItems = document.getElementById("shoppingListItems");
  const totalPrice = document.getElementById("totalPrice");
  const totalSavings = document.getElementById("totalSavings");

  if (shoppingList.length === 0) {
    listItems.innerHTML =
      '<p class="text-gray-500 text-center py-8">Votre liste de courses est vide</p>';
  } else {
    listItems.innerHTML = shoppingList
      .map(
        (item) => `
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <img src="${item.image}" alt="${
          item.name
        }" class="w-12 h-12 md:w-16 md:h-16 object-contain rounded flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-sm leading-tight mb-1 truncate">${
            item.name
          }</h4>
          <p class="text-indigo-600 font-semibold text-sm">${item.price}</p>
          ${
            item.saved
              ? `<p class="text-green-600 text-xs">Économie : ${item.saved}</p>`
              : ""
          }
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button onclick="updateQuantity('${item.name.replace(
            /'/g,
            "\\'"
          )}', ${item.quantity - 1})" 
                  class="w-7 h-7 md:w-8 md:h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
            -
          </button>
          <span class="w-6 md:w-8 text-center font-medium text-sm">${
            item.quantity
          }</span>
          <button onclick="updateQuantity('${item.name.replace(
            /'/g,
            "\\'"
          )}', ${item.quantity + 1})" 
                  class="w-7 h-7 md:w-8 md:h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
            +
          </button>
        </div>
        <button onclick="removeFromShoppingList('${item.name.replace(
          /'/g,
          "\\'"
        )}')" 
                class="text-red-500 hover:text-red-700 p-1 flex-shrink-0">
          🗑️
        </button>
      </div>
    `
      )
      .join("");
  }

  totalPrice.textContent = formatPrice(calculateTotal());

  // Update total savings display
  const savingsAmount = calculateTotalSavings();
  if (totalSavings) {
    totalSavings.textContent = formatPrice(savingsAmount);
  }
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

// Filter products by category
function filterProductsByCategory(category) {
  let products = [];

  if (category === "Promotions") {
    // For promotions, get all valid promotions
    const validPromotions = allPromotions.filter((promo) =>
      isPromotionValid(promo.promotion_end)
    );
    console.log(
      "Valid promotions found:",
      validPromotions.length,
      validPromotions
    );
    products = validPromotions;
  } else if (category === "Produits Pas Chers") {
    // For cheap products, get all regular products regardless of their specific category
    products = allProducts;
  } else {
    // Filter regular products by category
    const categoryProducts = allProducts.filter((p) =>
      p.category.includes(category)
    );
    console.log(
      "Category products found:",
      categoryProducts.length,
      categoryProducts
    );
    products = categoryProducts;
  }

  return products;
}

// Render filtered products
function renderProducts(products = null) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  // Use provided products or filter by current category
  const productsToRender =
    products || filterProductsByCategory(currentCategory);
  filteredProducts = productsToRender; // Store filtered products

  console.log(
    "Rendering products:",
    productsToRender.length,
    "for category:",
    currentCategory
  );

  if (productsToRender.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">🏪</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Aucun produit disponible</h3>
        <p class="text-gray-500">
          ${
            currentCategory === "Promotions"
              ? "Aucune promotion active pour le moment."
              : `Aucun produit de cette catégorie n'est disponible.`
          }
        </p>
      </div>
    `;
    return;
  }

  productsToRender.forEach((p, index) => {
    // Check if it's a promotion product
    const isPromotion = currentCategory === "Promotions";
    const promotionBadge = isPromotion
      ? `
      <div class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
        🔥 PROMO
      </div>
    `
      : "";

    const originalPriceDisplay =
      isPromotion && p.original_price && p.original_price !== "0.00 MAD"
        ? `
      <p class="text-gray-400 line-through text-sm">Prix normal : ${p.original_price}</p>
    `
        : "";

    const promotionDateDisplay =
      isPromotion && (p.promotion_date || p.promotion_end)
        ? `
      <p class="text-red-600 text-xs font-medium">
        ${formatPromotionDate(
          p.promotion_date || p.promotion_end,
          p.promotion_end
        )}
      </p>
    `
        : "";

    // Show supermarket badge for all products
    const supermarketBadge = p.supermarkets
      ? `
      <div class="flex flex-wrap gap-1 mt-2">
        ${p.supermarkets
          .map(
            (supermarket) => `
          <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded capitalize">${supermarket}</span>
        `
          )
          .join("")}
      </div>
    `
      : "";

    grid.innerHTML += `
      <div class="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition flex flex-col h-full relative">
        ${promotionBadge}
        <img src="${p.image}" alt="${
      p.name
    }" class="w-40 h-40 md:w-60 md:h-60 object-contain rounded-md mx-auto mb-4 flex-shrink-0" />

        <div class="flex flex-col justify-between flex-1">
          <div class="space-y-2">
            <h3 class="text-base md:text-lg font-semibold leading-tight">${
              p.name
            }</h3>
            ${
              p.description
                ? `<p class="text-sm text-gray-600 line-clamp-2">
                  ${p.description}
                </p>`
                : ""
            }

            ${originalPriceDisplay}

            <!-- Price + Info Icon -->
            <div class="flex items-center gap-2">
              <p class="text-indigo-600 font-bold text-sm ${
                isPromotion ? "text-lg" : ""
              }">Prix : ${p.price}</p>
              ${
                !isPromotion
                  ? `<span class="text-gray-400 text-sm cursor-pointer group relative">
                ℹ️
                <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-60 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                  Ceci est le prix recommandé, les prix peuvent varier selon le supermarché.
                </span>
              </span>`
                  : ""
              }
            </div>

            ${
              p.saved && p.saved !== "0.00 MAD"
                ? `
                <div class="flex items-center gap-2">
                <p class="text-green-600 font-medium text-sm ${
                  isPromotion ? "font-bold" : ""
                }">Économisez : ${p.saved}</p>
                ${
                  !isPromotion
                    ? `<span class="text-gray-400 text-sm cursor-pointer group relative">
                ℹ️
                <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-60 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                  Vos économies sont calculées en moyenne basées sur les prix de produits similaires.
                </span>`
                    : ""
                }
              </span></div>`
                : ""
            }

            ${promotionDateDisplay}
            ${supermarketBadge}
          </div>

          <div class="pt-4 flex flex-row justify-between">
            <button
              onclick="addToShoppingList(filteredProducts[${index}])"
              class="bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700 transition whitespace-nowrap">
              Ajouter à la Liste
            </button>
            <button onclick="openModal(${index})"
              class="bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700 transition whitespace-nowrap">
              Détails du Produit
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

window.goToProductDetails = function (index) {
  const product = filteredProducts[index];
  localStorage.setItem("selectedProduct", JSON.stringify(product));
  window.location.href = "details.html";
};

// Mobile menu toggle
function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
}

// Shopping list panel controls
function setupShoppingListControls() {
  const toggleListBtn = document.getElementById("toggleListBtn");
  const closeListBtn = document.getElementById("closeListBtn");
  const shoppingListPanel = document.getElementById("shoppingListPanel");

  // Toggle shopping list panel
  toggleListBtn.addEventListener("click", () => {
    shoppingListPanel.classList.remove("hidden");
  });

  // Close shopping list panel (mobile)
  if (closeListBtn) {
    closeListBtn.addEventListener("click", () => {
      shoppingListPanel.classList.add("hidden");
    });
  }

  // Close when clicking backdrop
  shoppingListPanel.addEventListener("click", (e) => {
    if (e.target === shoppingListPanel) {
      shoppingListPanel.classList.add("hidden");
    }
  });
}

// Initialize the application
function initializeApp() {
  console.log("Initializing app...");

  // Add SEO-friendly page title updates based on category
  function updatePageTitle(category) {
    const titles = {
      Promotions:
        "🔥 Promotions Maroc 2025 | Amelal ⴰⵎⵍⴰⵍ | Offres Marjane BIM",
      "Produits Pas Chers":
        "Produits Pas Chers Maroc | Alimentation Boissons Ménage | Amelal ⴰⵎⵍⴰⵍ",
    };
    document.title =
      titles[category] || "Amelal - Promotions Maroc | Produits Pas Chers";
  }

  // Fetch both regular products and promotions
  Promise.resolve([productsData, promotionsData])
    .then(([products, promotions]) => {
      promotions.sort(
        (a, b) => new Date(a.promotion_end) - new Date(b.promotion_end)
      );

      allProducts = products;
      allPromotions = promotions;

      console.log("Loaded products:", allProducts.length);
      console.log("Loaded promotions:", allPromotions.length);

      renderSupermarketFilters(allProducts, allPromotions);

      renderProducts();
      loadShoppingList();
      setupMobileMenu();
      setupShoppingListControls();

      // Filter button logic
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".filter-btn").forEach((b) => {
            b.classList.remove("bg-indigo-600", "text-white");
            b.classList.add("hover:bg-indigo-100");
          });
          btn.classList.add("bg-indigo-600", "text-white");
          btn.classList.remove("hover:bg-indigo-100");
          currentCategory = btn.dataset.category;
          console.log("Category changed to:", currentCategory);
          updatePageTitle(currentCategory);
          if (currentCategory !== "Promotions") {
            document.getElementById("searchInput").classList.remove("hidden");
            document.getElementById("searchInput").value = ""; // clear search
          } else {
            document.getElementById("searchInput").classList.add("hidden");
          }
          renderProducts();
        });
      });
    })
    .catch((error) => {
      console.error("Error loading products:", error);
      const grid = document.getElementById("product-grid");
      grid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Erreur de chargement</h3>
          <p class="text-gray-500">
            Impossible de charger les produits. Veuillez rafraîchir la page.
          </p>
        </div>
      `;
    });
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);

// Open modal and show product details
window.openModal = function (index) {
  function encodeProductToBase64(product) {
    const json = JSON.stringify(product);
    return btoa(encodeURIComponent(json)); // Base64 encode
  }
  // Use the filtered products array instead of allProducts
  currentProductIndex = index;
  const product = filteredProducts[index];
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const productDetails = document.getElementById("productDetails");

  const productEncoded = encodeProductToBase64(product);
  const shareLink = `/details.html?data=${productEncoded}`;
  console.log("shareLink :>> ", shareLink);
  const shareProductBtn = document.getElementById("shareProductBtn");
  shareProductBtn.dataset.product = productEncoded;

  modalTitle.textContent = "Détails du Produit";

  // Check if it's a promotion product
  const isPromotion = currentCategory === "Promotions";

  // Build product details HTML
  let detailsHTML = `
    <div class="flex gap-4">
      <img src="${product.image}" alt="${
    product.name
  }" class="w-20 h-20 md:w-24 md:h-24 object-contain rounded-lg flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold mb-2 leading-tight">${
          product.name
        }</h3>
        ${
          product.description
            ? `<p class="text-sm text-gray-600 mb-2">${product.description}</p>`
            : ""
        }
        ${
          isPromotion
            ? '<span class="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold">🔥 PROMOTION</span>'
            : ""
        }
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
      ${
        isPromotion &&
        product.original_price &&
        product.original_price !== "0.00 MAD"
          ? `
        <div class="bg-red-50 p-3 rounded">
          <span class="font-medium text-gray-700">Prix Normal :</span>
          <p class="text-gray-500 line-through">${product.original_price}</p>
        </div>
      `
          : ""
      }
      
      <!-- Row 1: Prix and Économisez -->
      <div class="bg-gray-50 p-2 rounded">
        <span class="font-medium text-gray-700 text-xs">Prix ${
          isPromotion ? "Promo" : ""
        } :</span>
        <p class="text-indigo-600 font-bold text-sm ${
          isPromotion ? "text-base" : ""
        }">${product.price}</p>
      </div>
      
      ${
        isPromotion && product.saved && product.saved !== "0.00 MAD"
          ? `<div class="bg-green-50 p-2 rounded">
        <span class="font-medium text-gray-700 text-xs">Économisez :</span>
        <p class="text-green-600 font-bold text-sm">${
          product.saved || "0 MAD"
        }</p>
      </div>`
          : ""
      }
      
      <!-- Row 2: Volume and Disponible chez -->
      ${
        product.volume || product.weight || product.quantity
          ? `<div class="bg-gray-50 p-2 rounded">
        <span class="font-medium text-gray-700 text-xs">${
          product.volume ? "Volume" : product.weight ? "Poids" : "Quantité"
        } :</span>
        <p class="font-semibold text-sm">${
          product.volume || product.weight || product.quantity || "N/A"
        }</p>
      </div>`
          : ""
      }
      
      <div class="bg-blue-50 p-2 rounded">
        <span class="font-medium text-gray-700 text-xs">Disponible chez :</span>
        <div class="flex flex-wrap gap-1 mt-1">
          ${product.supermarkets
            .map(
              (supermarket) => `
            <span class="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded capitalize">${supermarket}</span>
          `
            )
            .join("")}
        </div>
      </div>
      
      <!-- Fourth Cell: Either empty filler or "Ouvrir le Catalogue" button -->
      ${
        isPromotion && product.catalog
          ? `
          <div class="bg-yellow-50 p-2 rounded flex items-center justify-center">
            <a href="${product.catalog}" target="_blank" rel="noopener noreferrer"
              class="inline-block bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold px-3 py-1 rounded-full transition">
              📖 Ouvrir le Catalogue
            </a>
          </div>
        `
          : isPromotion
          ? '<div class="bg-gray-50 p-2 rounded opacity-50"></div>'
          : ""
      }

    </div>
  `;

  // Add alternatives section if available (only for regular products)
  if (!isPromotion && product.alternatives && product.alternatives.length > 0) {
    detailsHTML += `
      <div class="bg-blue-50 p-4 rounded-lg">
        <h4 class="font-semibold text-gray-800 mb-3">Produits Alternatifs</h4>
        <div class="space-y-3">
          ${product.alternatives
            .map(
              (alt) => `
            <div class="bg-white p-3 rounded border border-blue-200">
              <div class="flex gap-3">
                <img src="${alt.image}" alt="${
                alt.name
              }" class="w-10 h-10 md:w-12 md:h-12 object-contain rounded flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <h5 class="font-medium text-sm text-gray-800 leading-tight">${
                    alt.name
                  }</h5>
                  <p class="text-xs text-gray-600 mb-1 line-clamp-2">${
                    alt.description
                  }</p>
                  <div class="flex items-center justify-between">
                    <span class="text-indigo-600 font-bold text-sm">${
                      alt.price
                    }</span>
                    ${
                      alt.volume
                        ? `<span class="text-xs text-gray-500">${alt.volume}</span>`
                        : ""
                    }
                  </div>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  productDetails.innerHTML = detailsHTML;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

// Share product button
document.getElementById("shareProductBtn").addEventListener("click", () => {
  const shareProductBtn = document.getElementById("shareProductBtn");
  const encodedProduct = shareProductBtn?.dataset.product;

  if (!encodedProduct) {
    console.warn("Aucune donnée produit trouvée.");
    return;
  }

  // Decode the product just for use in share title/text
  let product;
  try {
    const decoded = decodeURIComponent(atob(encodedProduct));
    product = JSON.parse(decoded);
  } catch (err) {
    console.error("Erreur lors du décodage du produit :", err);
    return;
  }

  const productLink = `${window.location.origin}/details.html?data=${encodedProduct}`;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile && navigator.share) {
    navigator
      .share({
        title: product.name || "Produit",
        text: "Découvrez ce produit :",
        url: productLink,
      })
      .then(() => {
        console.log("Partage réussi");
      })
      .catch((err) => {
        console.warn("Partage annulé ou erreur :", err);
      });
  } else {
    navigator.clipboard
      .writeText(productLink)
      .then(() => {
        showNotification("Le lien de partage est copié", "info");
      })
      .catch((err) => {
        console.error("Erreur lors de la copie :", err);
      });
  }
});

// Close modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
  currentProductIndex = null;
});

// Add to list button
document.getElementById("addToListBtn").addEventListener("click", () => {
  if (currentProductIndex !== null) {
    // Use the filtered products array
    const product = filteredProducts[currentProductIndex];
    addToShoppingList(product);
    document.getElementById("modal").classList.add("hidden");
    currentProductIndex = null;
  }
});

// Search functionality scoped to current category
// document.getElementById("searchInput").addEventListener("input", (e) => {
//   const keyword = e.target.value.toLowerCase();
//   const selectedMarkets = Array.from(
//     document.querySelectorAll(".supermarket-btn.bg-indigo-600")
//   ).map((btn) => btn.dataset.market.trim());

//   const categoryProducts = filterProductsByCategory(currentCategory);

//   const now = new Date();

//   const filtered = categoryProducts.filter((p) => {
//     // If current category is Promotions, filter expired ones
//     if (currentCategory === "Promotions") {
//       const promotionEndDate = new Date(p.promotion_end);
//       if (promotionEndDate < now) return false;
//     }

//     const matchesSearch = !keyword || p.name.toLowerCase().includes(keyword);

//     const productMarkets = (p.supermarkets || []).map((s) => s.trim());

//     const matchesMarket =
//       selectedMarkets.length === 0 ||
//       selectedMarkets.some((m) => productMarkets.includes(m));

//     return matchesSearch && matchesMarket;
//   });

//   renderProducts(filtered);
// });

// Close modal when clicking outside
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") {
    document.getElementById("modal").classList.add("hidden");
    currentProductIndex = null;
  }
});

function renderSupermarketFilters(products, promotions) {
  const allSupermarkets = new Set();

  [...products, ...promotions].forEach((item) => {
    (item.supermarkets || []).forEach((market) =>
      allSupermarkets.add(market.trim())
    );
  });

  const filterContainer = document.getElementById("supermarket-filters");
  filterContainer.innerHTML = "";

  // Sort and render buttons with images instead of text
  [...allSupermarkets].sort().forEach((market) => {
    // Find the matching supermarket info from the supermarkets array
    const supermarketInfo = supermarkets.find(
      (s) => s.name.toLowerCase() === market.toLowerCase()
    );

    const btn = document.createElement("button");
    btn.className =
      "supermarket-btn px-3 md:px-4 py-2 border text-sm font-medium hover:bg-indigo-100 transition whitespace-nowrap flex items-center justify-center";
    btn.dataset.market = market;

    if (supermarketInfo) {
      const img = document.createElement("img");
      img.src = supermarketInfo.image;
      img.alt = supermarketInfo.name;
      img.style.height = "60px";
      img.style.width = "auto";
      img.style.objectFit = "contain";
      btn.appendChild(img);
    } else {
      // Fallback: just show the name if no image found
      btn.textContent = market;
    }

    filterContainer.appendChild(btn);
  });

  // Click handler for filtering
  document.querySelectorAll(".supermarket-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("bg-indigo-600");
      btn.classList.toggle("text-white");
      btn.classList.toggle("hover:bg-indigo-100");
      filterAndRender();
    });
  });
}

function filterAndRender() {
  const searchQuery = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const selectedCategory =
    document.querySelector(".filter-btn.bg-indigo-600")?.dataset.category ||
    "Produits Pas Chers"; // default category

  const selectedMarkets = Array.from(
    document.querySelectorAll(".supermarket-btn.bg-indigo-600")
  ).map((btn) => btn.dataset.market.trim());

  let sourceData =
    selectedCategory === "Promotions" ? allPromotions : allProducts;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const filtered = sourceData.filter((product) => {
    // If promotions category, filter out expired promotions
    if (selectedCategory === "Promotions") {
      const promotionEndDate = new Date(product.promotion_end);
      promotionEndDate.setHours(0, 0, 0, 0);
      if (promotionEndDate < now) {
        return false; // skip expired promotions
      }
    }

    const matchesSearch =
      !searchQuery || product.name.toLowerCase().includes(searchQuery);

    const productMarkets = (product.supermarkets || []).map((s) => s.trim());

    const matchesMarket =
      selectedMarkets.length === 0 ||
      selectedMarkets.some((m) => productMarkets.includes(m));

    return matchesSearch && matchesMarket;
  });

  renderProducts(filtered);
}
