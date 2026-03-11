document.addEventListener("DOMContentLoaded", () => {
  // Ürünü sepete ekler ve localStorage'da saklar
  function addToCart(product) {
    const storageKey = "cartItems";
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");

    // Aynı ürünü isim üzerinden bul ve adet arttır
    const foundIndex = existing.findIndex(
      (item) => item.name === product.name
    );

    if (foundIndex !== -1) {
      existing[foundIndex].quantity += 1;
    } else {
      existing.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(storageKey, JSON.stringify(existing));
    renderMiniCart(existing);
  }

  // Header içindeki küçük sepeti günceller
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

      const removeIcon = document.createElement("i");
      removeIcon.className = "fas fa-times";
      removeIcon.addEventListener("click", () => {
        const updated = [...items];
        updated.splice(index, 1);
        localStorage.setItem("cartItems", JSON.stringify(updated));
        renderMiniCart(updated);
      });

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;

      const content = document.createElement("div");
      content.className = "content";

      const title = document.createElement("h3");
      title.textContent = item.name;

      const price = document.createElement("div");
      price.className = "price";
      price.textContent = `${item.price} TL x ${item.quantity}`;

      content.appendChild(title);
      content.appendChild(price);

      cartItem.appendChild(removeIcon);
      cartItem.appendChild(img);
      cartItem.appendChild(content);

      container.appendChild(cartItem);
    });

    const checkoutLink = document.createElement("a");
    checkoutLink.href = "cart.html";
    checkoutLink.className = "btn";
    checkoutLink.textContent = "Sepete Git";
    container.appendChild(checkoutLink);
  }

  // Sayfa ilk yüklendiğinde localStorage'dan sepeti oku
  const initialItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  renderMiniCart(initialItems);

  // Menüdeki tüm ürün kartlarına "Sepete Ekle" olayını bağla
  document.querySelectorAll(".menu .box").forEach((box) => {
    const nameEl = box.querySelector(".box-head h3");
    const priceEl = box.querySelector(".box-head .price");
    const imgEl = box.querySelector(".box-head img");
    const btn = box.querySelector(".box-bottom .btn");

    if (!nameEl || !priceEl || !imgEl || !btn) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const name = nameEl.textContent.trim();
      const priceText = priceEl.childNodes[0].textContent.trim(); // "350 TL" kısmı

      const product = {
        name,
        price: priceText,
        image: imgEl.getAttribute("src"),
      };

      addToCart(product);
    });
  });
});

