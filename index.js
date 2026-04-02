document.addEventListener("DOMContentLoaded", () => {
  const productBoxes = Array.from(document.querySelectorAll(".menu .box"));
  const categoryFilterEl = document.getElementById("category-filter");
  const productSearchEl = document.getElementById("product-search");
  const productResultInfoEl = document.getElementById("product-result-info");

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

  function normalizeText(value) {
    return (value || "")
      .toString()
      .toLocaleLowerCase("tr-TR")
      .replace(/\s+/g, " ")
      .trim();
  }

  function fillCategoryOptions() {
    if (!categoryFilterEl) return;

    const uniqueCategories = new Set();
    productBoxes.forEach((box) => {
      const categoryText = box.querySelector(".menu-category")?.textContent || "";
      if (normalizeText(categoryText)) {
        uniqueCategories.add(categoryText.trim());
      }
    });

    Array.from(uniqueCategories)
      .sort((a, b) => a.localeCompare(b, "tr"))
      .forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilterEl.appendChild(option);
      });
  }

  function applyProductFilters() {
    const selectedCategory = categoryFilterEl ? categoryFilterEl.value : "all";
    const searchTerm = normalizeText(productSearchEl ? productSearchEl.value : "");
    let visibleCount = 0;

    productBoxes.forEach((box) => {
      const name = normalizeText(box.querySelector("h3")?.textContent);
      const category = normalizeText(box.querySelector(".menu-category")?.textContent);

      const categoryMatch =
        selectedCategory === "all" ||
        normalizeText(selectedCategory) === category;
      const searchMatch =
        !searchTerm || name.includes(searchTerm) || category.includes(searchTerm);

      const isVisible = categoryMatch && searchMatch;
      box.style.display = isVisible ? "" : "none";
      if (isVisible) visibleCount += 1;
    });

    if (productResultInfoEl) {
      productResultInfoEl.textContent = `${visibleCount} ürün listeleniyor.`;
    }
  }

  fillCategoryOptions();
  applyProductFilters();

  if (categoryFilterEl) {
    categoryFilterEl.addEventListener("change", applyProductFilters);
  }
  if (productSearchEl) {
    productSearchEl.addEventListener("input", applyProductFilters);
  }

  // Menüdeki tüm ürün kartlarına "Sepete Ekle" olayını bağla
  productBoxes.forEach((box) => {
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

