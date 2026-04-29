document.addEventListener("DOMContentLoaded", () => {
  const detailRoot = document.getElementById("product-detail");
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  function formatPriceText(price) {
    return (price || "").trim();
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
  }

  function getReviewStorageKey(id) {
    return `productReviews:${id}`;
  }

  function getProductReviews(id) {
    return JSON.parse(localStorage.getItem(getReviewStorageKey(id)) || "[]");
  }

  function saveProductReviews(id, reviews) {
    localStorage.setItem(getReviewStorageKey(id), JSON.stringify(reviews));
  }

  function formatDate(dateValue) {
    const d = new Date(dateValue);
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function getAverageRating(reviews) {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }

  function renderReviews(id) {
    const reviews = getProductReviews(id);
    const averageRating = getAverageRating(reviews);
    const avgRatingEl = document.getElementById("product-avg-rating");
    const reviewCountEl = document.getElementById("product-review-count");
    const reviewListEl = document.getElementById("review-list");

    if (avgRatingEl) {
      avgRatingEl.textContent = averageRating
        ? averageRating.toFixed(1)
        : product.rating;
    }
    if (reviewCountEl) {
      reviewCountEl.textContent = averageRating
        ? `${reviews.length} değerlendirme`
        : `${product.reviews} değerlendirme`;
    }
    if (!reviewListEl) return;

    if (!reviews.length) {
      reviewListEl.innerHTML =
        '<p class="product-review-empty">Bu ürün için henüz yorum yapılmadı.</p>';
      return;
    }

    reviewListEl.innerHTML = reviews
      .slice()
      .reverse()
      .map(
        (review) => `
          <div class="product-review-item">
            <div class="product-review-head">
              <h3>${review.name}</h3>
              <span>${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span>
            </div>
            <p class="product-review-date">${formatDate(review.createdAt)}</p>
            <p class="product-review-text">${review.comment}</p>
          </div>
        `
      )
      .join("");
  }

  if (!detailRoot) return;

  const catalog = JSON.parse(localStorage.getItem("productCatalog") || "[]");
  const product = catalog.find((item) => item.id === productId);

  if (!product) {
    detailRoot.innerHTML = `
      <div class="product-detail-empty">
        <h1>Ürün bulunamadı</h1>
        <p>Ürün detaylarını görmek için önce ana sayfadaki ürünlerden birine tıklayın.</p>
        <a href="index.html#products" class="btn">Ürünlere dön</a>
      </div>
    `;
    return;
  }

  detailRoot.innerHTML = `
    <div class="product-gallery-card">
      <img src="${product.image}" alt="${product.name}" class="product-main-image" />
    </div>
    <div class="product-info-card">
      <p class="product-breadcrumb">${product.category}</p>
      <h1 class="product-title">${product.name}</h1>
      <div class="product-rating-row">
        <span><i class="fas fa-star"></i> <strong id="product-avg-rating">${product.rating}</strong></span>
        <span id="product-review-count">${product.reviews} değerlendirme</span>
      </div>
      <div class="product-price-box">
        <p class="product-current-price">${formatPriceText(product.price)}</p>
        ${
          product.oldPrice
            ? `<p class="product-old-price">${formatPriceText(product.oldPrice)}</p>`
            : ""
        }
      </div>
      <div class="product-meta-list">
        <p><strong>Satıcı:</strong> ${product.seller}</p>
        <p><strong>Teslimat:</strong> ${product.shipping}</p>
      </div>
      <div class="product-action-row">
        <button id="add-to-cart-detail" class="btn product-add-cart-btn">Sepete Ekle</button>
        <a href="index.html#products" class="btn product-back-btn">Ürünlere Dön</a>
      </div>
      <div class="product-description-card">
        <h2>Ürün Açıklaması</h2>
        <p>${product.description}</p>
      </div>
    </div>
    <div class="product-review-section">
      <div class="product-review-form-card">
        <h2>Ürünü Değerlendir</h2>
        <form id="review-form" class="product-review-form" novalidate>
          <input
            type="text"
            id="review-name"
            class="search-input"
            placeholder="Adınız"
            required
          />
          <select id="review-rating" class="search-input" required>
            <option value="">Puan seçin</option>
            <option value="5">5 - Çok iyi</option>
            <option value="4">4 - İyi</option>
            <option value="3">3 - Orta</option>
            <option value="2">2 - Zayıf</option>
            <option value="1">1 - Çok kötü</option>
          </select>
          <textarea
            id="review-comment"
            class="search-input"
            rows="4"
            placeholder="Ürün hakkındaki yorumunuzu yazın"
            required
          ></textarea>
          <p id="review-form-message" class="product-review-form-message"></p>
          <button type="submit" class="btn product-add-cart-btn">Yorum Gönder</button>
        </form>
      </div>
      <div class="product-review-list-card">
        <h2>Kullanıcı Yorumları</h2>
        <div id="review-list"></div>
      </div>
    </div>
  `;

  const addBtn = document.getElementById("add-to-cart-detail");
  if (!addBtn) return;

  addBtn.addEventListener("click", () => {
    addToCart({
      name: product.name,
      price: product.price,
      image: product.image,
    });
    addBtn.textContent = "Sepete Eklendi";
    addBtn.disabled = true;
    addBtn.style.opacity = "0.8";
  });

  const reviewForm = document.getElementById("review-form");
  const reviewNameInput = document.getElementById("review-name");
  const reviewRatingInput = document.getElementById("review-rating");
  const reviewCommentInput = document.getElementById("review-comment");
  const reviewMessage = document.getElementById("review-form-message");

  if (reviewForm && reviewNameInput && reviewRatingInput && reviewCommentInput) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = reviewNameInput.value.trim();
      const rating = Number(reviewRatingInput.value);
      const comment = reviewCommentInput.value.trim();

      if (!name || !rating || !comment) {
        if (reviewMessage) {
          reviewMessage.textContent = "Lütfen tüm alanları doldurun.";
          reviewMessage.classList.remove("is-success");
        }
        return;
      }

      const reviews = getProductReviews(product.id);
      reviews.push({
        name,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      });
      saveProductReviews(product.id, reviews);

      reviewForm.reset();
      if (reviewMessage) {
        reviewMessage.textContent = "Yorumunuz kaydedildi.";
        reviewMessage.classList.add("is-success");
      }
      renderReviews(product.id);
    });
  }

  renderReviews(product.id);
});
