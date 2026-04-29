document.addEventListener("DOMContentLoaded", function () {
  if (!window.shopAuth || !window.shopTracking) return;

  var ADMIN_PRODUCTS_KEY = "adminProducts";
  var STATUS_OPTIONS = ["Hazırlanıyor", "Kargoda", "Teslim edildi", "İptal"];

  var userCountEl = document.getElementById("admin-user-count");
  var productCountEl = document.getElementById("admin-product-count");
  var orderCountEl = document.getElementById("admin-order-count");
  var inTransitCountEl = document.getElementById("admin-in-transit-count");
  var sessionEmailEl = document.getElementById("admin-session-email");

  var usersTbody = document.getElementById("admin-users-tbody");
  var productsTbody = document.getElementById("admin-products-tbody");
  var ordersTbody = document.getElementById("admin-orders-tbody");
  var trackingTbody = document.getElementById("admin-tracking-tbody");

  var productForm = document.getElementById("admin-product-form");
  var trackingForm = document.getElementById("admin-tracking-form");
  var orderSearchInput = document.getElementById("admin-order-search");
  var orderStatusFilter = document.getElementById("admin-order-status-filter");

  var modalEl = document.getElementById("admin-order-modal");
  var modalCloseBtn = document.getElementById("admin-order-modal-close");
  var modalContentEl = document.getElementById("admin-order-modal-content");

  if (sessionEmailEl) {
    sessionEmailEl.textContent = shopAuth.currentUserEmail() || "—";
  }

  function formatDate(ts) {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function escapeHtml(value) {
    var d = document.createElement("div");
    d.textContent = value == null ? "" : String(value);
    return d.innerHTML;
  }

  function getCatalogProducts() {
    try {
      return JSON.parse(localStorage.getItem("productCatalog") || "[]");
    } catch (e) {
      return [];
    }
  }

  function getAdminProducts() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveAdminProducts(list) {
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(list));
  }

  function getAllOrders() {
    return shopTracking.listAll();
  }

  function openOrderModal(row) {
    if (!modalEl || !modalContentEl) return;
    modalContentEl.innerHTML = `
      <p><strong>Kayıt ID:</strong> ${escapeHtml(row.id)}</p>
      <p><strong>Müşteri:</strong> ${escapeHtml(row.customerEmail || "—")}</p>
      <p><strong>Sipariş:</strong> ${escapeHtml(row.orderLabel || "—")}</p>
      <p><strong>Durum:</strong> ${escapeHtml(row.status || "—")}</p>
      <p><strong>Kargo firması:</strong> ${escapeHtml(row.carrier || "—")}</p>
      <p><strong>Takip no:</strong> ${escapeHtml(row.trackingCode || "—")}</p>
      <p><strong>Not:</strong> ${escapeHtml(row.note || "—")}</p>
      <p><strong>Oluşturma:</strong> ${escapeHtml(formatDate(row.createdAt))}</p>
      <p><strong>Son güncelleme:</strong> ${escapeHtml(formatDate(row.updatedAt))}</p>
    `;
    modalEl.classList.add("is-open");
    modalEl.setAttribute("aria-hidden", "false");
  }

  function closeOrderModal() {
    if (!modalEl) return;
    modalEl.classList.remove("is-open");
    modalEl.setAttribute("aria-hidden", "true");
  }

  function renderStats() {
    var users = shopAuth.getUsers();
    var products = getCatalogProducts().concat(getAdminProducts());
    var orders = getAllOrders();
    var inTransitCount = orders.filter(function (o) {
      return (o.status || "").toLowerCase() === "kargoda";
    }).length;

    if (userCountEl) userCountEl.textContent = String(users.length);
    if (productCountEl) productCountEl.textContent = String(products.length);
    if (orderCountEl) orderCountEl.textContent = String(orders.length);
    if (inTransitCountEl) inTransitCountEl.textContent = String(inTransitCount);
  }

  function renderUsers() {
    if (!usersTbody) return;
    var users = shopAuth.getUsers();
    usersTbody.innerHTML = "";
    if (!users.length) {
      usersTbody.innerHTML =
        '<tr><td colspan="2" class="user-tracking-empty">Kullanıcı bulunamadı.</td></tr>';
      return;
    }

    users.forEach(function (user) {
      var tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(user.email || "—")}</td>
        <td><span class="admin-v2-badge">${escapeHtml(user.role || "user")}</span></td>
      `;
      usersTbody.appendChild(tr);
    });
  }

  function renderProducts() {
    if (!productsTbody) return;
    var baseProducts = getCatalogProducts().map(function (p) {
      return Object.assign({}, p, { source: "Mağaza", managed: false });
    });
    var adminProducts = getAdminProducts().map(function (p) {
      return Object.assign({}, p, { source: "Admin", managed: true });
    });
    var products = baseProducts.concat(adminProducts);

    productsTbody.innerHTML = "";
    if (!products.length) {
      productsTbody.innerHTML =
        '<tr><td colspan="6" class="user-tracking-empty">Ürün kaydı bulunamadı.</td></tr>';
      return;
    }

    products.forEach(function (product) {
      var tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(product.name || "—")}</td>
        <td>${escapeHtml(product.category || "—")}</td>
        <td>${escapeHtml(product.price || "—")}</td>
        <td>${escapeHtml(String(product.stock == null ? "—" : product.stock))}</td>
        <td><span class="admin-v2-badge">${escapeHtml(product.source)}</span></td>
        <td></td>
      `;
      var actionCell = tr.lastElementChild;
      if (product.managed) {
        var delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn admin-v2-btn-danger";
        delBtn.textContent = "Sil";
        delBtn.addEventListener("click", function () {
          var list = getAdminProducts().filter(function (item) {
            return item.id !== product.id;
          });
          saveAdminProducts(list);
          renderProducts();
          renderStats();
        });
        actionCell.appendChild(delBtn);
      } else {
        actionCell.innerHTML = '<span class="admin-v2-muted">Salt okunur</span>';
      }
      productsTbody.appendChild(tr);
    });
  }

  function renderOrders() {
    if (!ordersTbody) return;
    var rows = getAllOrders();
    var search = (orderSearchInput && orderSearchInput.value || "").trim().toLowerCase();
    var statusFilter = orderStatusFilter ? orderStatusFilter.value : "all";
    var filtered = rows.filter(function (row) {
      var matchesSearch =
        !search ||
        (row.customerEmail || "").toLowerCase().indexOf(search) !== -1 ||
        (row.orderLabel || "").toLowerCase().indexOf(search) !== -1 ||
        (row.id || "").toLowerCase().indexOf(search) !== -1;
      var matchesStatus = statusFilter === "all" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    ordersTbody.innerHTML = "";
    if (!filtered.length) {
      ordersTbody.innerHTML =
        '<tr><td colspan="6" class="user-tracking-empty">Filtreye uygun sipariş bulunamadı.</td></tr>';
      return;
    }

    filtered.forEach(function (row) {
      var tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(formatDate(row.updatedAt || row.createdAt))}</td>
        <td>${escapeHtml(row.customerEmail || "—")}</td>
        <td>${escapeHtml(row.orderLabel || "—")}</td>
        <td><span class="admin-v2-badge">${escapeHtml(row.status || "—")}</span></td>
        <td>${escapeHtml((row.carrier || "—") + " / " + (row.trackingCode || "—"))}</td>
        <td></td>
      `;
      var detailBtn = document.createElement("button");
      detailBtn.type = "button";
      detailBtn.className = "btn";
      detailBtn.textContent = "Detay";
      detailBtn.addEventListener("click", function () {
        openOrderModal(row);
      });
      tr.lastElementChild.appendChild(detailBtn);
      ordersTbody.appendChild(tr);
    });
  }

  function renderTrackingTable() {
    if (!trackingTbody) return;
    var rows = getAllOrders();
    trackingTbody.innerHTML = "";
    if (!rows.length) {
      trackingTbody.innerHTML =
        '<tr><td colspan="6" class="user-tracking-empty">Henüz takip kaydı yok.</td></tr>';
      return;
    }

    rows.forEach(function (row) {
      var tr = document.createElement("tr");
      var statusSelect = document.createElement("select");
      statusSelect.className = "search-input";
      STATUS_OPTIONS.forEach(function (s) {
        var opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        if (s === row.status) opt.selected = true;
        statusSelect.appendChild(opt);
      });
      statusSelect.addEventListener("change", function () {
        shopTracking.update(row.id, { status: statusSelect.value });
        refreshAll();
      });

      tr.innerHTML = `
        <td>${escapeHtml(formatDate(row.updatedAt || row.createdAt))}</td>
        <td>${escapeHtml(row.customerEmail || "—")}</td>
        <td>${escapeHtml(row.orderLabel || "—")}</td>
        <td></td>
        <td>${escapeHtml((row.carrier || "—") + " / " + (row.trackingCode || "—"))}</td>
        <td></td>
      `;

      tr.children[3].appendChild(statusSelect);

      var actionWrap = document.createElement("div");
      actionWrap.className = "admin-v2-actions";
      var deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn admin-v2-btn-danger";
      deleteBtn.textContent = "Sil";
      deleteBtn.addEventListener("click", function () {
        if (confirm("Bu takip kaydını silmek istediğinize emin misiniz?")) {
          shopTracking.remove(row.id);
          refreshAll();
        }
      });
      actionWrap.appendChild(deleteBtn);
      tr.children[5].appendChild(actionWrap);
      trackingTbody.appendChild(tr);
    });
  }

  function refreshAll() {
    renderStats();
    renderUsers();
    renderProducts();
    renderOrders();
    renderTrackingTable();
  }

  if (productForm) {
    productForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("admin-product-name").value.trim();
      var category = document.getElementById("admin-product-category").value.trim();
      var price = document.getElementById("admin-product-price").value.trim();
      var oldPrice = document.getElementById("admin-product-old-price").value.trim();
      var image = document.getElementById("admin-product-image").value.trim();
      var stock = Number(document.getElementById("admin-product-stock").value);
      var status = document.getElementById("admin-product-status").value;

      if (!name || !category || !price || !image) {
        alert("Lütfen zorunlu ürün alanlarını doldurun.");
        return;
      }

      var list = getAdminProducts();
      list.push({
        id: "AP-" + Date.now().toString(36),
        name: name,
        category: category,
        price: price,
        oldPrice: oldPrice,
        image: image,
        stock: isNaN(stock) ? 0 : stock,
        status: status,
        createdAt: Date.now(),
      });
      saveAdminProducts(list);
      productForm.reset();
      document.getElementById("admin-product-stock").value = "10";
      document.getElementById("admin-product-status").value = "Aktif";
      refreshAll();
    });
  }

  if (trackingForm) {
    trackingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var result = shopTracking.create({
        customerEmail: document.getElementById("track-customer-email").value,
        orderLabel: document.getElementById("track-order-label").value,
        status: document.getElementById("track-status").value,
        carrier: document.getElementById("track-carrier").value,
        trackingCode: document.getElementById("track-code").value,
        note: document.getElementById("track-note").value,
      });
      if (!result.ok) {
        alert(result.error);
        return;
      }
      trackingForm.reset();
      document.getElementById("track-status").selectedIndex = 0;
      refreshAll();
    });
  }

  if (orderSearchInput) {
    orderSearchInput.addEventListener("input", renderOrders);
  }
  if (orderStatusFilter) {
    orderStatusFilter.addEventListener("change", renderOrders);
  }
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeOrderModal);
  }
  if (modalEl) {
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl) closeOrderModal();
    });
  }

  refreshAll();
});
