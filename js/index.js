document.addEventListener("DOMContentLoaded", async () => {
  const BACKEND_ORIGIN = (() => {
    const { protocol, hostname, port } = window.location;
    const isStaticDevServer = port === "5500" || port === "3000" || port === "5173";
    if (isStaticDevServer) return `${protocol}//${hostname}:5000`;
    return window.location.origin;
  })();
  const API_BASE = BACKEND_ORIGIN + "/api";

  function resolveAssetUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return raw;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("/")) return BACKEND_ORIGIN + raw;
    return raw;
  }
  const listRoot = document.getElementById("product-list-root");
  const productSearchEl = document.getElementById("product-search");
  const productResultInfoEl = document.getElementById("product-result-info");
  const categoryPillsRoot = document.getElementById("category-pills");

  let products = [];
  let selectedCategory = "all";

  function formatPrice(value) {
    return Number(value || 0).toFixed(2) + " TL";
  }

  function parsePriceToNumber(priceText) {
    if (!priceText) return 0;
    const digits = String(priceText).replace(/[^\d,\.]/g, "").replace(",", ".");
    const num = parseFloat(digits);
    return Number.isNaN(num) ? 0 : num;
  }

  function showToast(message) {
    const text = String(message || "").trim();
    if (!text) return;

    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.innerHTML = `<i class="fas fa-check-circle"></i><span>${text}</span>`;
    document.body.appendChild(el);

    requestAnimationFrame(() => el.classList.add("is-visible"));

    setTimeout(() => {
      el.classList.remove("is-visible");
      setTimeout(() => el.remove(), 220);
    }, 1000);
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
    showToast("Sepete eklendi");
  }

  function readFavorites() {
    try {
      return JSON.parse(localStorage.getItem("favoriteItems") || "[]");
    } catch {
      return [];
    }
  }

  function saveFavorites(items) {
    localStorage.setItem("favoriteItems", JSON.stringify(items || []));
  }

  function isFavorited(productId) {
    const favs = readFavorites();
    return favs.some((f) => String(f.id) === String(productId));
  }

  function toggleFavorite(item) {
    const favs = readFavorites();
    const idx = favs.findIndex((f) => String(f.id) === String(item.id));
    if (idx === -1) {
      favs.push(item);
    } else {
      favs.splice(idx, 1);
    }
    saveFavorites(favs);
    return idx === -1;
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
        <img src="${resolveAssetUrl(item.image)}" alt="${item.name}" />
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

  function renderCategoryPills() {
    if (!categoryPillsRoot) return;
    categoryPillsRoot.innerHTML = "";
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    unique.sort((a, b) => a.localeCompare(b, "tr"));
    const list = ["all", ...unique];

    const current = selectedCategory || "all";
    list.forEach((value) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "category-pill" + (value === current ? " is-active" : "");
      btn.dataset.value = value;
      btn.textContent = value === "all" ? "Tümü" : value;
      btn.addEventListener("click", () => {
        selectedCategory = value;
        syncCategoryPills();
        applyProductFilters();
      });
      categoryPillsRoot.appendChild(btn);
    });
  }

  function syncCategoryPills() {
    if (!categoryPillsRoot) return;
    const current = selectedCategory || "all";
    categoryPillsRoot.querySelectorAll(".category-pill").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.value === current);
    });
  }

  function applyProductFilters() {
    const activeCategory = selectedCategory || "all";
    const searchTerm = normalizeText(productSearchEl ? productSearchEl.value : "");

    const filtered = products.filter((p) => {
      const categoryMatch =
        activeCategory === "all" || normalizeText(activeCategory) === normalizeText(p.category);
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
      const productId = product._id || product.id || "p-" + index;
      const favored = isFavorited(productId);
      const card = document.createElement("div");
      card.className = "box";
      card.innerHTML = `
        <div class="box-head" data-product-id="${productId}">
          <img src="${resolveAssetUrl(product.image)}" alt="menu" />
          <span class="menu-category">${product.category || "Kategori"}</span>
          <h3>${product.name}</h3>
          <div class="price">${formatPrice(product.price)} ${product.oldPrice ? `<span>${formatPrice(product.oldPrice)}</span>` : ""}</div>
        </div>
        <div class="box-bottom">
          <a href="#" class="btn">Sepete Ekle</a>
          <button type="button" class="btn btn-favorite ${favored ? "is-favorited" : ""}">
            <i class="fas fa-heart"></i>
            <span>${favored ? "Favoriden Çıkar" : "Favoriye Ekle"}</span>
          </button>
        </div>
      `;

      const addBtn = card.querySelector(".box-bottom .btn");
      addBtn.addEventListener("click", (e) => {
        e.preventDefault();
        addToCart({
          name: product.name,
          price: formatPrice(product.price),
          image: resolveAssetUrl(product.image)
        });
      });

      const favBtn = card.querySelector(".btn-favorite");
      favBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleFavorite({
          id: productId,
          name: product.name,
          category: product.category,
          price: formatPrice(product.price),
          image: resolveAssetUrl(product.image)
        });
        favBtn.classList.toggle("is-favorited", added);
        const label = favBtn.querySelector("span");
        if (label) label.textContent = added ? "Favoriden Çıkar" : "Favoriye Ekle";
      });

      const head = card.querySelector(".box-head");
      head.style.cursor = "pointer";
      head.addEventListener("click", () => {
        window.location.href = `urun-detay.html?id=${encodeURIComponent(productId)}`;
      });

      listRoot.appendChild(card);
    });

    const catalog = list.map((p) => ({
      id: p._id || p.id,
      name: p.name,
      category: p.category,
      price: formatPrice(p.price),
      oldPrice: p.oldPrice ? formatPrice(p.oldPrice) : "",
      image: resolveAssetUrl(p.image),
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
    renderCategoryPills();
    applyProductFilters();
  } catch (e) {
    if (productResultInfoEl) productResultInfoEl.textContent = "Ürünler yüklenemedi.";
  }

  if (productSearchEl) productSearchEl.addEventListener("input", applyProductFilters);

  const initialItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  renderMiniCart(initialItems);
});
