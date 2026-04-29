document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "favoriteItems";
  const listEl = document.getElementById("favorite-list");

  if (!listEl) return;

  function getFavorites() {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  }

  function renderFavorites() {
    const items = getFavorites();
    listEl.innerHTML = "";

    if (!items.length) {
      listEl.innerHTML = `
        <div class="favorites-empty">
          Favori ürününüz bulunmuyor.
          <span>Ana sayfadan ürün kartlarındaki Favori butonunu kullanabilirsiniz.</span>
        </div>
      `;
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "favorites-card";
      card.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <div class="favorites-card-content">
          <span class="menu-category">Favori Ürün</span>
          <h3>${item.name}</h3>
          <p class="price">${item.price}</p>
        </div>
        <div class="favorites-card-actions">
          <a href="index.html#products" class="btn">Ürüne Git</a>
          <button type="button" class="btn favorites-remove-btn" data-index="${index}">Kaldır</button>
        </div>
      `;
      listEl.appendChild(card);
    });

    listEl.querySelectorAll(".favorites-remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        const items = getFavorites();
        items.splice(index, 1);
        localStorage.setItem(storageKey, JSON.stringify(items));
        renderFavorites();
      });
    });
  }

  renderFavorites();
});
