document.addEventListener("DOMContentLoaded", function () {
  var CART_KEY = "cartItems";
  var ORDER_KEY = "shopOrders";
  var itemsWrap = document.getElementById("checkout-items");
  var totalEl = document.getElementById("checkout-total");
  var form = document.getElementById("checkout-form");
  var errEl = document.getElementById("checkout-error");
  var paymentSelect = document.getElementById("checkout-payment");
  var cardFieldsWrap = document.getElementById("checkout-card-fields");
  var cardNameInput = document.getElementById("checkout-card-name");
  var cardNumberInput = document.getElementById("checkout-card-number");
  var cardExpiryInput = document.getElementById("checkout-card-expiry");
  var cardCvvInput = document.getElementById("checkout-card-cvv");

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveOrders(list) {
    localStorage.setItem(ORDER_KEY, JSON.stringify(list));
  }

  function readOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function parsePriceToNumber(priceText) {
    if (!priceText) return 0;
    var digits = String(priceText).replace(/[^\d,\.]/g, "").replace(",", ".");
    var num = parseFloat(digits);
    return isNaN(num) ? 0 : num;
  }

  function formatPrice(num) {
    return num.toFixed(2) + " TL";
  }

  function renderSummary(items) {
    var total = 0;
    itemsWrap.innerHTML = "";

    if (!items.length) {
      itemsWrap.innerHTML = "<p class='user-tracking-empty'>Sepetiniz boş. Lütfen önce ürün ekleyin.</p>";
      totalEl.textContent = "0 TL";
      if (form) form.querySelector("button[type='submit']").disabled = true;
      return;
    }

    items.forEach(function (item) {
      var qty = Number(item.quantity || 1);
      var unit = parsePriceToNumber(item.price);
      var lineTotal = unit * qty;
      total += lineTotal;

      var row = document.createElement("div");
      row.className = "checkout-item-row";
      row.innerHTML =
        "<span>" +
        (item.name || "Ürün") +
        " x " +
        qty +
        "</span><strong>" +
        formatPrice(lineTotal) +
        "</strong>";
      itemsWrap.appendChild(row);
    });

    totalEl.textContent = formatPrice(total);
  }

  var currentEmail = window.shopAuth ? shopAuth.currentUserEmail() : "";
  var emailInput = document.getElementById("checkout-email");
  if (emailInput && currentEmail) {
    emailInput.value = currentEmail;
    emailInput.setAttribute("readonly", "readonly");
    emailInput.style.opacity = "0.9";
  }

  var cartItems = readCart();
  renderSummary(cartItems);

  if (!form) return;

  function toggleCardFields() {
    if (!paymentSelect || !cardFieldsWrap) return;
    var isCard = paymentSelect.value === "Kart ile Ödeme";
    cardFieldsWrap.style.display = isCard ? "block" : "none";
  }

  if (paymentSelect) {
    paymentSelect.addEventListener("change", toggleCardFields);
    toggleCardFields();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errEl.textContent = "";

    var items = readCart();
    if (!items.length) {
      errEl.textContent = "Sepetiniz boş. Önce ürün ekleyin.";
      return;
    }

    var fullName = document.getElementById("checkout-fullname").value.trim();
    var phone = document.getElementById("checkout-phone").value.trim();
    var email = document.getElementById("checkout-email").value.trim().toLowerCase();
    if (currentEmail) {
      email = String(currentEmail).trim().toLowerCase();
    }
    var address = document.getElementById("checkout-address").value.trim();
    var payment = document.getElementById("checkout-payment").value;

    if (!fullName || !phone || !email || !address || !payment) {
      errEl.textContent = "Lütfen tüm zorunlu alanları doldurun.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errEl.textContent = "Geçerli bir e-posta adresi girin.";
      return;
    }

    if (payment === "Kart ile Ödeme") {
      var cardName = cardNameInput.value.trim();
      var cardNumber = cardNumberInput.value.replace(/\s+/g, "");
      var cardExpiry = cardExpiryInput.value.trim();
      var cardCvv = cardCvvInput.value.trim();

      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        errEl.textContent = "Kart ile ödeme için tüm kart bilgilerini doldurun.";
        return;
      }
      if (!/^\d{16}$/.test(cardNumber)) {
        errEl.textContent = "Kart numarası 16 haneli olmalıdır.";
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        errEl.textContent = "Son kullanma tarihini AA/YY formatında girin.";
        return;
      }
      if (!/^\d{3,4}$/.test(cardCvv)) {
        errEl.textContent = "CVV 3 veya 4 haneli olmalıdır.";
        return;
      }
    }

    var total = items.reduce(function (sum, item) {
      return sum + parsePriceToNumber(item.price) * Number(item.quantity || 1);
    }, 0);

    var orderNo = "SIP-" + Date.now().toString(36).toUpperCase();
    var order = {
      id: orderNo,
      fullName: fullName,
      phone: phone,
      email: email,
      address: address,
      paymentMethod: payment,
      items: items,
      total: total,
      status: "Hazırlanıyor",
      createdAt: Date.now(),
    };

    var orders = readOrders();
    orders.push(order);
    saveOrders(orders);

    if (window.shopTracking && shopTracking.create) {
      shopTracking.create({
        customerEmail: email,
        orderLabel: orderNo + " - " + fullName,
        status: "Hazırlanıyor",
        carrier: "",
        trackingCode: "",
        note: "Ödeme: " + payment,
      });
    }

    localStorage.removeItem(CART_KEY);
    alert("Siparişiniz oluşturuldu. Sipariş no: " + orderNo);
    location.href = "user-panel.html";
  });
});
