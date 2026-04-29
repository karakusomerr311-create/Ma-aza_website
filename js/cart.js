document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "cartItems";
  const listEl = document.getElementById("cart-list");
  const totalEl = document.getElementById("cart-total");
  const totalDisplayEl = document.getElementById("cart-total-display");
  const itemCountEl = document.getElementById("cart-item-count");
  const clearBtn = document.getElementById("cart-clear");
  const checkoutBtn = document.getElementById("cart-checkout");

  function parsePriceToNumber(priceText) {
    // "350 TL" -> 350
    if (!priceText) return 0;
    const digits = priceText.replace(/[^\d,\.]/g, "").replace(",", ".");
    const num = parseFloat(digits);
    return isNaN(num) ? 0 : num;
  }

  function formatPrice(num) {
    return `${num.toFixed(2)} TL`;
  }

  function readItems() {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  }

  function saveItems(items) {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }

  function updateItemQuantity(index, delta) {
    const items = readItems();
    if (!items[index]) return;
    const currentQty = Number(items[index].quantity || 1);
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      items.splice(index, 1);
    } else {
      items[index].quantity = nextQty;
    }
    saveItems(items);
    renderCart();
  }

  function removeItem(index) {
    const items = readItems();
    items.splice(index, 1);
    saveItems(items);
    renderCart();
  }

  function renderCart() {
    const items = readItems();
    listEl.innerHTML = "";

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "cart-v2-empty";
      empty.innerHTML = `
        <h3>Sepetiniz şu anda boş</h3>
        <p>Beğendiğiniz ürünleri eklediğinizde burada görüntülenecek.</p>
        <a href="index.html#products" class="btn">Alışverişe Başla</a>
      `;
      listEl.appendChild(empty);
      totalEl.textContent = "0 TL";
      if (totalDisplayEl) totalDisplayEl.textContent = "0 TL";
      if (itemCountEl) itemCountEl.textContent = "0";
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    let total = 0;
    let itemCount = 0;

    items.forEach((item, index) => {
      const qty = Number(item.quantity || 1);
      const singlePrice = parsePriceToNumber(item.price);
      const lineTotal = singlePrice * qty;
      total += lineTotal;
      itemCount += qty;

      const card = document.createElement("article");
      card.className = "cart-v2-item";
      card.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-v2-image" />
        <div class="cart-v2-content">
          <p class="cart-v2-category">Sepet Ürünü</p>
          <h3>${item.name}</h3>
          <p class="cart-v2-unit-price">Birim fiyat: ${item.price}</p>
        </div>
        <div class="cart-v2-actions">
          <div class="cart-v2-qty-control">
            <button type="button" class="cart-v2-qty-btn" data-action="decrease" data-index="${index}">-</button>
            <span>${qty}</span>
            <button type="button" class="cart-v2-qty-btn" data-action="increase" data-index="${index}">+</button>
          </div>
          <p class="cart-v2-line-total">${formatPrice(lineTotal)}</p>
          <button type="button" class="btn cart-v2-remove-btn" data-action="remove" data-index="${index}">Ürünü Sil</button>
        </div>
      `;
      listEl.appendChild(card);
    });

    listEl.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        const index = Number(btn.getAttribute("data-index"));
        if (action === "increase") updateItemQuantity(index, 1);
        if (action === "decrease") updateItemQuantity(index, -1);
        if (action === "remove") removeItem(index);
      });
    });

    const formatted = formatPrice(total);
    totalEl.textContent = formatted;
    if (totalDisplayEl) totalDisplayEl.textContent = formatted;
    if (itemCountEl) itemCountEl.textContent = String(itemCount);
    if (checkoutBtn) checkoutBtn.disabled = false;
  }

  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    renderCart();
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const items = readItems();
      if (!items.length) {
        checkoutBtn.disabled = true;
        return;
      }
      location.href = "checkout.html";
    });
  }

  renderCart();
});

