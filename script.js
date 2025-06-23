let allProducts = [];
let currentCategory = "Affordable";

// Render filtered products
function renderProducts(products = allProducts) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  products
    .filter((p) => p.category === currentCategory)
    .forEach((p, index) => {
      grid.innerHTML += `
        <div class="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4 flex-1">
            <img src="${p.image}" alt="${p.name}" class="w-24 h-24 object-cover rounded-md">
            <div>
              <h3 class="text-lg font-semibold">${p.name}</h3>
              <p class="text-sm text-gray-600">${p.description}</p>
              <p class="text-indigo-600 font-bold text-sm mt-1">${p.price}</p>
            </div>
          </div>
          <div class="flex justify-end md:justify-center">
            <button onclick="openModal(${index})"
              class="bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700 transition whitespace-nowrap">
              Where to Buy
            </button>
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

// Open modal and show where to buy
window.openModal = function (index) {
  const product = allProducts[index];
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const storeList = document.getElementById("storeList");

  modalTitle.textContent = `Where to Buy "${product.name}"`;
  storeList.innerHTML = "";

  const iconMap = {
    marjane: "🛒",
    carrefour: "🏬",
    glovo: "🚚",
    jumia: "📦",
    hanout: "🏪",
  };

  product.stores?.forEach((store) => {
    const icon = iconMap[store.id?.toLowerCase()] || "🛍️";
    storeList.innerHTML += `
      <div class="flex items-center justify-between bg-gray-50 p-3 rounded border">
        <div class="flex items-center gap-3">
          <span class="text-2xl">${icon}</span>
          <span class="font-medium text-gray-800">${store.name}</span>
        </div>
        <a href="${store.link}" target="_blank"
          class="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition">
          Visit
        </a>
      </div>
    `;
  });

  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

// Close modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

// Search functionality scoped to current category
document.getElementById("searchInput").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = allProducts.filter(
    (p) =>
      p.category === currentCategory && p.name.toLowerCase().includes(keyword)
  );
  renderProducts(filtered);
});
