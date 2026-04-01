document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("user-panel-email");
  if (el && window.shopAuth) {
    el.textContent = shopAuth.currentUserEmail() || "—";
  }
});
