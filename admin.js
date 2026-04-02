document.addEventListener("DOMContentLoaded", function () {
  if (!window.shopAuth || !window.shopTracking) return;

  var users = shopAuth.getUsers();
  var userEl = document.getElementById("admin-user-count");
  var trackCountEl = document.getElementById("admin-tracking-count");
  var sessionEmail = document.getElementById("admin-session-email");
  var tbody = document.getElementById("admin-tracking-tbody");
  var form = document.getElementById("admin-tracking-form");

  if (sessionEmail) {
    sessionEmail.textContent = shopAuth.currentUserEmail() || "—";
  }
  if (userEl) userEl.textContent = String(users.length);
  if (trackCountEl) {
    trackCountEl.textContent = String(shopTracking.listAll().length);
  }

  var STATUS_OPTIONS = ["Hazırlanıyor", "Kargoda", "Teslim edildi", "İptal"];

  function formatDate(ts) {
    if (!ts) return "—";
    var d = new Date(ts);
    return d.toLocaleString("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function renderTable() {
    if (!tbody || !shopTracking) return;
    var rows = shopTracking.listAll();
    if (trackCountEl) trackCountEl.textContent = String(rows.length);

    tbody.innerHTML = "";
    if (!rows.length) {
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      td.colSpan = 6;
      td.className = "user-tracking-empty";
      td.textContent = "Henüz takip kaydı yok.";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    rows.forEach(function (row) {
      var tr = document.createElement("tr");

      var td0 = document.createElement("td");
      td0.textContent = formatDate(row.updatedAt || row.createdAt);

      var td1 = document.createElement("td");
      td1.textContent = row.customerEmail || "—";

      var td2 = document.createElement("td");
      td2.textContent = row.orderLabel || "—";

      var td3 = document.createElement("td");
      var sel = document.createElement("select");
      sel.className = "search-input";
      STATUS_OPTIONS.forEach(function (s) {
        var opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        if (s === row.status) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener("change", function () {
        shopTracking.update(row.id, { status: sel.value });
        renderTable();
      });
      td3.appendChild(sel);

      var td4 = document.createElement("td");
      if (row.carrier) {
        var sm0 = document.createElement("small");
        sm0.style.color = "#9ca3af";
        sm0.textContent = row.carrier;
        td4.appendChild(sm0);
        td4.appendChild(document.createElement("br"));
      }
      var badge = document.createElement("span");
      badge.className = "tracking-badge";
      badge.textContent = row.trackingCode || "—";
      td4.appendChild(badge);
      if (row.note) {
        td4.appendChild(document.createElement("br"));
        var sm1 = document.createElement("small");
        sm1.style.color = "#9ca3af";
        sm1.textContent = row.note;
        td4.appendChild(sm1);
      }

      var td5 = document.createElement("td");
      td5.className = "admin-tracking-actions";
      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn--danger";
      delBtn.textContent = "Sil";
      delBtn.addEventListener("click", function () {
        if (confirm("Bu takip kaydını silmek istediğinize emin misiniz?")) {
          shopTracking.remove(row.id);
          renderTable();
        }
      });
      td5.appendChild(delBtn);

      tr.appendChild(td0);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      tr.appendChild(td5);
      tbody.appendChild(tr);
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
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
      form.reset();
      document.getElementById("track-status").selectedIndex = 0;
      renderTable();
    });
  }

  renderTable();
});
