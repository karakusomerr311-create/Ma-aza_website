document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("register-form");
  var errEl = document.getElementById("register-error");
  var okEl = document.getElementById("register-success");
  if (!form || !window.shopAuth) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errEl.textContent = "";
    okEl.textContent = "";

    var email = document.getElementById("register-email").value;
    var password = document.getElementById("register-password").value;
    var password2 = document.getElementById("register-password2").value;

    if (password !== password2) {
      errEl.textContent = "Şifreler eşleşmiyor.";
      return;
    }

    var result = shopAuth.registerUser(email, password);
    if (!result.ok) {
      errEl.textContent = result.error;
      return;
    }

    okEl.textContent = "Kayıt başarılı. Giriş sayfasına yönlendiriliyorsunuz…";
    setTimeout(function () {
      location.href = "login.html";
    }, 800);
  });
});
