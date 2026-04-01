document.addEventListener("DOMContentLoaded", function () {
  if (!window.shopAuth) return;
  var users = shopAuth.getUsers();
  var userEl = document.getElementById("admin-user-count");
  var adminEl = document.getElementById("admin-admin-count");
  if (userEl) userEl.textContent = String(users.length);
  if (adminEl) {
    var admins = users.filter(function (u) {
      return u.role === "admin";
    });
    adminEl.textContent = String(admins.length);
  }
});
