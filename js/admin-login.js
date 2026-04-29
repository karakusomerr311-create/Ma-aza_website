document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("admin-login-form");
  var errEl = document.getElementById("admin-login-error");
  if (!form || !window.shopAuth) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errEl.textContent = "";

    var email = document.getElementById("admin-login-email").value;
    var password = document.getElementById("admin-login-password").value;

    var result = await shopAuth.loginAdmin(email, password);
    if (!result.ok) {
      errEl.textContent = result.error;
      return;
    }

    var next = sessionStorage.getItem("redirectAfterLogin");
    sessionStorage.removeItem("redirectAfterLogin");
    location.href =
      next && next !== "admin-login.html" && next !== "login.html"
        ? next
        : "admin.html";
  });
});
