document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("user-panel-email");
  if (el && window.shopAuth) {
    el.textContent = shopAuth.currentUserEmail() || "—";
  }

  renderFavorites();

  var root = document.getElementById("user-tracking-root");
  if (!root || !window.shopAuth || !window.shopTracking) return;

  var email = shopAuth.currentUserEmail();
  if (!email) return;

  var rows = shopTracking.listForEmail(email);
  root.innerHTML = "";

  if (!rows.length) {
    var p = document.createElement("p");
    p.className = "user-tracking-empty";
    p.textContent = "Henüz size atanmış bir takip kaydı yok.";
    root.appendChild(p);
    return;
  }

  rows.forEach(function (row) {
    var card = document.createElement("article");
    card.className = "user-tracking-card";

    var h = document.createElement("h3");
    h.textContent = row.orderLabel || "Sipariş";
    card.appendChild(h);

    var meta = document.createElement("div");
    meta.className = "user-tracking-meta";

    var statusLine = document.createElement("p");
    statusLine.innerHTML =
      "<strong>Durum:</strong> " + escape(row.status || "—");
    meta.appendChild(statusLine);

    if (row.carrier) {
      var c = document.createElement("p");
      c.innerHTML = "<strong>Kargo:</strong> " + escape(row.carrier);
      meta.appendChild(c);
    }
    if (row.trackingCode) {
      var t = document.createElement("p");
      t.innerHTML = "<strong>Takip no:</strong> " + escape(row.trackingCode);
      meta.appendChild(t);
    }
    if (row.note) {
      var n = document.createElement("p");
      n.innerHTML = "<strong>Not:</strong> " + escape(row.note);
      meta.appendChild(n);
    }

    var time = document.createElement("p");
    var ts = row.updatedAt || row.createdAt;
    time.innerHTML =
      "<strong>Son güncelleme:</strong> " +
      (ts
        ? new Date(ts).toLocaleString("tr-TR", {
            dateStyle: "short",
            timeStyle: "short",
          })
        : "—");
    meta.appendChild(time);

    card.appendChild(meta);
    root.appendChild(card);
  });

  function escape(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderFavorites() {
    var favRoot = document.getElementById("user-favorites-root");
    if (!favRoot) return;
    var items = [];
    try {
      items = JSON.parse(localStorage.getItem("favoriteItems") || "[]");
    } catch {
      items = [];
    }

    favRoot.innerHTML = "";
    if (!items.length) {
      favRoot.innerHTML =
        '<div class="favorites-empty">Henüz favori ürününüz yok.<span>Ana sayfadan ürünleri favoriye ekleyebilirsiniz.</span></div>';
      return;
    }

    items.forEach(function (item, index) {
      var card = document.createElement("div");
      card.className = "favorites-card";
      card.innerHTML =
        '<img src="' +
        escape(item.image || "") +
        '" alt="' +
        escape(item.name || "Ürün") +
        '" />' +
        '<div class="favorites-card-content">' +
        '<span class="menu-category">Favori Ürün</span>' +
        "<h3>" +
        escape(item.name || "") +
        "</h3>" +
        '<p class="price">' +
        escape(item.price || "") +
        "</p>" +
        "</div>" +
        '<div class="favorites-card-actions">' +
        '<a href="urun-detay.html?id=' +
        encodeURIComponent(item.id || "") +
        '" class="btn">Detay</a>' +
        '<button type="button" class="btn favorites-remove-btn" data-index="' +
        index +
        '">Kaldır</button>' +
        "</div>";
      favRoot.appendChild(card);
    });

    favRoot.querySelectorAll(".favorites-remove-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = Number(btn.getAttribute("data-index"));
        var items = [];
        try {
          items = JSON.parse(localStorage.getItem("favoriteItems") || "[]");
        } catch {
          items = [];
        }
        items.splice(i, 1);
        localStorage.setItem("favoriteItems", JSON.stringify(items));
        renderFavorites();
      });
    });
  }
});
