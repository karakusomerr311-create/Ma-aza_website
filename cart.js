document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "cartItems";
  const listEl = document.getElementById("cart-list");
  const totalEl = document.getElementById("cart-total");
  const totalDisplayEl = document.getElementById("cart-total-display");
  const clearBtn = document.getElementById("cart-clear");

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

  function renderCart() {
    const items = JSON.parse(localStorage.getItem(storageKey) || "[]");
    listEl.innerHTML = "";

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "cart-empty";
      empty.innerHTML = `
        Sepetiniz boş.
        <span>Alışverişe devam etmek için ürünlere göz atabilirsiniz.</span>
      `;
      listEl.appendChild(empty);
      totalEl.textContent = "0 TL";
      if (totalDisplayEl) totalDisplayEl.textContent = "0 TL";
      return;
    }

    let total = 0;

    items.forEach((item, index) => {
      const box = document.createElement("div");
      box.className = "box";

      const head = document.createElement("div");
      head.className = "box-head";

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;

      const category = document.createElement("span");
      category.className = "menu-category";
      category.textContent = "Sepet Ürünü";

      const title = document.createElement("h3");
      title.textContent = item.name;

      const singlePrice = parsePriceToNumber(item.price);
      const lineTotal = singlePrice * (item.quantity || 1);
      total += lineTotal;

      const price = document.createElement("div");
      price.className = "price";
      price.textContent = `${formatPrice(lineTotal)} (${item.price} x ${
        item.quantity || 1
      })`;

      head.appendChild(img);
      head.appendChild(category);
      head.appendChild(title);
      head.appendChild(price);

      const bottom = document.createElement("div");
      bottom.className = "box-bottom";

      const qtySpan = document.createElement("span");
      qtySpan.style.marginRight = "1rem";
      qtySpan.textContent = `Adet: ${item.quantity || 1}`;

      const removeBtn = document.createElement("a");
      removeBtn.href = "#";
      removeBtn.className = "btn";
      removeBtn.textContent = "Kaldır";
      removeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const updated = JSON.parse(
          localStorage.getItem(storageKey) || "[]"
        );
        updated.splice(index, 1);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        renderCart();
      });

      bottom.appendChild(qtySpan);
      bottom.appendChild(removeBtn);

      box.appendChild(head);
      box.appendChild(bottom);

      listEl.appendChild(box);
    });

    const formatted = formatPrice(total);
    totalEl.textContent = formatted;
    if (totalDisplayEl) totalDisplayEl.textContent = formatted;
  }

  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    renderCart();
  });

  renderCart();
});

