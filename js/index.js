document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = window.location.origin + "/api";
  const listRoot = document.getElementById("product-list-root");
  const categoryFilterEl = document.getElementById("category-filter");
  const productSearchEl = document.getElementById("product-search");
  const productResultInfoEl = document.getElementById("product-result-info");

  let products = [];

  function formatPrice(value) {
    return Number(value || 0).toFixed(2) + " TL";
  }

  function parsePriceToNumber(priceText) {
    if (!priceText) return 0;
    const digits = String(priceText).replace(/[^\d,\.]/g, "").replace(",", ".");
    const num = parseFloat(digits);
    return Number.isNaN(num) ? 0 : num;
  }

  function addToCart(product) {
    const storageKey = "cartItems";
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const foundIndex = existing.findIndex((item) => item.name === product.name);
    if (foundIndex !== -1) {
      existing[foundIndex].quantity += 1;
    } else {
      existing.push({ ...product, quantity: 1 });
    }
    localStorage.setItem(storageKey, JSON.stringify(existing));
    renderMiniCart(existing);
  }

  function renderMiniCart(items) {
    const container = document.querySelector(".cart-items-container");
    if (!container) return;
    container.innerHTML = "";

    if (!items.length) {
      const emptyInfo = document.createElement("p");
      emptyInfo.textContent = "Sepetiniz boş.";
      emptyInfo.style.padding = "1rem";
      container.appendChild(emptyInfo);
      return;
    }

    items.forEach((item, index) => {
      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";
      cartItem.innerHTML = `
        <i class="fas fa-times" data-index="${index}"></i>
        <img src="${item.image}" alt="${item.name}" />
        <div class="content">
          <h3>${item.name}</h3>
          <div class="price">${item.price} x ${item.quantity}</div>
        </div>
      `;
      container.appendChild(cartItem);
    });

    container.querySelectorAll(".fa-times").forEach((icon) => {
      icon.addEventListener("click", () => {
        const i = Number(icon.getAttribute("data-index"));
        const updated = [...items];
        updated.splice(i, 1);
        localStorage.setItem("cartItems", JSON.stringify(updated));
        renderMiniCart(updated);
      });
    });

    const checkoutLink = document.createElement("a");
    checkoutLink.href = "cart.html";
    checkoutLink.className = "btn";
    checkoutLink.textContent = "Sepete Git";
    container.appendChild(checkoutLink);
  }

  function normalizeText(value) {
    return (value || "").toString().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();
  }

  function fillCategoryOptions() {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    unique.sort((a, b) => a.localeCompare(b, "tr"));
    unique.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilterEl.appendChild(option);
    });
  }

  function applyProductFilters() {
    const selectedCategory = categoryFilterEl ? categoryFilterEl.value : "all";
    const searchTerm = normalizeText(productSearchEl ? productSearchEl.value : "");

    const filtered = products.filter((p) => {
      const categoryMatch =
        selectedCategory === "all" || normalizeText(selectedCategory) === normalizeText(p.category);
      const searchMatch =
        !searchTerm ||
        normalizeText(p.name).includes(searchTerm) ||
        normalizeText(p.category).includes(searchTerm);
      return categoryMatch && searchMatch;
    });

    renderProducts(filtered);
    if (productResultInfoEl) {
      productResultInfoEl.textContent = `${filtered.length} ürün listeleniyor.`;
    }
  }

  function renderProducts(list) {
    listRoot.innerHTML = "";

    list.forEach((product, index) => {
      const card = document.createElement("div");
      card.className = "box";
      card.innerHTML = `
        <div class="box-head" data-product-id="${product._id || product.id || "p-" + index}">
          <img src="${product.image}" alt="menu" />
          <span class="menu-category">${product.category || "Kategori"}</span>
          <h3>${product.name}</h3>
          <div class="price">${formatPrice(product.price)} ${product.oldPrice ? `<span>${formatPrice(product.oldPrice)}</span>` : ""}</div>
        </div>
        <div class="box-bottom">
          <a href="#" class="btn">Sepete Ekle</a>
        </div>
      `;

      const addBtn = card.querySelector(".box-bottom .btn");
      addBtn.addEventListener("click", (e) => {
        e.preventDefault();
        addToCart({
          name: product.name,
          price: formatPrice(product.price),
          image: product.image
        });
      });

      const head = card.querySelector(".box-head");
      head.style.cursor = "pointer";
      head.addEventListener("click", () => {
        const id = product._id || product.id;
        window.location.href = `urun-detay.html?id=${encodeURIComponent(id)}`;
      });

      listRoot.appendChild(card);
    });

    const catalog = list.map((p) => ({
      id: p._id || p.id,
      name: p.name,
      category: p.category,
      price: formatPrice(p.price),
      oldPrice: p.oldPrice ? formatPrice(p.oldPrice) : "",
      image: p.image,
      stock: p.stock,
      rating: "4.7",
      reviews: 100,
      seller: "Magaza Official",
      shipping: "Kargo ücretsiz",
      description:
        "Kaliteli kumaş ve modern kalıp ile günlük kullanıma uygun olarak tasarlanmıştır."
    }));
    localStorage.setItem("productCatalog", JSON.stringify(catalog));
  }

  try {
    const res = await fetch(API_BASE + "/products");
    const data = await res.json();
    products = data.products || [];
    fillCategoryOptions();
    applyProductFilters();
  } catch (e) {
    if (productResultInfoEl) productResultInfoEl.textContent = "Ürünler yüklenemedi.";
  }

  if (categoryFilterEl) categoryFilterEl.addEventListener("change", applyProductFilters);
  if (productSearchEl) productSearchEl.addEventListener("input", applyProductFilters);

  const initialItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  renderMiniCart(initialItems);
});
