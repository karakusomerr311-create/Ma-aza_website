(function () {
  var KEY = "shopOrderTracking";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function generateId() {
    return (
      "TRK-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random().toString(36).slice(2, 6).toUpperCase()
    );
  }

  window.shopTracking = {
    listAll: function () {
      return load().sort(function (a, b) {
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
    },

    listForEmail: function (email) {
      var n = (email || "").trim().toLowerCase();
      return load()
        .filter(function (o) {
          return (o.customerEmail || "").toLowerCase() === n;
        })
        .sort(function (a, b) {
          return (b.updatedAt || 0) - (a.updatedAt || 0);
        });
    },

    getById: function (id) {
      return load().find(function (o) {
        return o.id === id;
      });
    },

    create: function (data) {
      var list = load();
      var row = {
        id: generateId(),
        customerEmail: (data.customerEmail || "").trim().toLowerCase(),
        orderLabel: (data.orderLabel || "").trim() || "Sipariş",
        status: data.status || "Hazırlanıyor",
        carrier: (data.carrier || "").trim(),
        trackingCode: (data.trackingCode || "").trim(),
        note: (data.note || "").trim(),
        updatedAt: Date.now(),
        createdAt: Date.now(),
      };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.customerEmail)) {
        return { ok: false, error: "Geçerli müşteri e-postası girin." };
      }
      list.push(row);
      save(list);
      return { ok: true, order: row };
    },

    update: function (id, patch) {
      var list = load();
      var i = list.findIndex(function (o) {
        return o.id === id;
      });
      if (i === -1) return { ok: false, error: "Kayıt bulunamadı." };
      var o = list[i];
      if (patch.customerEmail != null) {
        var em = String(patch.customerEmail).trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
          return { ok: false, error: "Geçerli e-posta girin." };
        }
        o.customerEmail = em;
      }
      if (patch.orderLabel != null) o.orderLabel = String(patch.orderLabel).trim() || o.orderLabel;
      if (patch.status != null) o.status = String(patch.status).trim();
      if (patch.carrier != null) o.carrier = String(patch.carrier).trim();
      if (patch.trackingCode != null) o.trackingCode = String(patch.trackingCode).trim();
      if (patch.note != null) o.note = String(patch.note).trim();
      o.updatedAt = Date.now();
      save(list);
      return { ok: true, order: o };
    },

    remove: function (id) {
      var next = load().filter(function (o) {
        return o.id !== id;
      });
      save(next);
      return { ok: true };
    },
  };
})();
