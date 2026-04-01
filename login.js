document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("login-form");
  var errEl = document.getElementById("login-error");
  if (!form || !window.shopAuth) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errEl.textContent = "";

    var email = document.getElementById("login-email").value;
    var password = document.getElementById("login-password").value;

    var result = shopAuth.loginUser(email, password);
    if (!result.ok) {
      errEl.textContent = result.error;
      return;
    }

    var next = sessionStorage.getItem("redirectAfterLogin");
    sessionStorage.removeItem("redirectAfterLogin");
    location.href = next && next !== "login.html" ? next : "index.html";
  });
});
