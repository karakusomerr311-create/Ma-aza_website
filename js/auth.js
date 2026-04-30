(function () {
  const SESSION_KEY = "shopSession";
  const ADMIN_EMAIL = "admin@gmail.com";
  const API_BASE = (() => {
    const { protocol, hostname, port } = window.location;
    const isStaticDevServer = port === "5500" || port === "3000" || port === "5173";
    if (isStaticDevServer) return `${protocol}//${hostname}:5000/api`;
    return window.location.origin + "/api";
  })();

  function getSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function setSession(email, role) {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        email: email,
        role: role || "user",
      })
    );
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function currentUserEmail() {
    var s = getSession();
    return s && s.email ? s.email : null;
  }

  function currentUserRole() {
    var s = getSession();
    return s && s.role ? s.role : null;
  }

  function isAdmin() {
    var s = getSession();
    return !!(s && s.email === ADMIN_EMAIL && s.role === "admin");
  }

  function getCurrentPageFilename() {
    var path = location.pathname || "";
    var parts = path.split("/");
    var last = parts[parts.length - 1] || "";
    if (!last || last.indexOf(".") === -1) return "index.html";
    return last;
  }

  function requireAuthRedirect() {
    if (isLoggedIn()) return;
    sessionStorage.setItem("redirectAfterLogin", getCurrentPageFilename());
    location.replace("login.html");
  }

  function requireAdminRedirect() {
    if (!isLoggedIn()) {
      sessionStorage.setItem("redirectAfterLogin", getCurrentPageFilename());
      location.replace("admin-login.html");
      return;
    }
    if (!isAdmin()) {
      location.replace("index.html");
    }
  }

  async function registerUser(email, password) {
    const res = await fetch(API_BASE + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    });
    const data = await res.json();
    return data;
  }

  async function loginUser(email, password) {
    const res = await fetch(API_BASE + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    });
    const data = await res.json();
    if (data.ok && data.user) setSession(data.user.email, data.user.role);
    return data;
  }

  async function loginAdmin(email, password) {
    const result = await loginUser(email, password);
    if (!result.ok) return result;
    if (!result.user || result.user.role !== "admin" || result.user.email !== ADMIN_EMAIL) {
      logout();
      return { ok: false, error: "Bu sayfa sadece yönetici hesabı içindir." };
    }
    return result;
  }

  async function getUsers() {
    try {
      const res = await fetch(API_BASE + "/users");
      const data = await res.json();
      return data.users || [];
    } catch (e) {
      return [];
    }
  }

  function logout() {
    clearSession();
  }

  window.shopAuth = {
    ADMIN_EMAIL: ADMIN_EMAIL,
    getUsers: getUsers,
    isLoggedIn: isLoggedIn,
    currentUserEmail: currentUserEmail,
    currentUserRole: currentUserRole,
    isAdmin: isAdmin,
    requireAuthRedirect: requireAuthRedirect,
    requireAdminRedirect: requireAdminRedirect,
    registerUser: registerUser,
    loginUser: loginUser,
    loginAdmin: loginAdmin,
    logout: logout,
    getCurrentPageFilename: getCurrentPageFilename,
  };

  document.addEventListener("DOMContentLoaded", function () {
    var loginLink = document.getElementById("auth-login-link");
    var registerLink = document.getElementById("auth-register-link");
    var logoutBtn = document.getElementById("auth-logout-btn");
    var userPanelLink = document.getElementById("auth-user-panel-link");
    var adminLink = document.getElementById("auth-admin-link");

    function show(el, visible) {
      if (!el) return;
      el.style.display = visible ? "inline-flex" : "none";
    }

    if (isLoggedIn()) {
      show(loginLink, false);
      show(registerLink, false);
      show(logoutBtn, true);
      show(userPanelLink, true);
      show(adminLink, isAdmin());
    } else {
      show(loginLink, true);
      show(registerLink, true);
      show(logoutBtn, false);
      show(userPanelLink, false);
      show(adminLink, false);
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        var wasAdmin = isAdmin();
        logout();
        location.href = wasAdmin ? "admin-login.html" : "login.html";
      });
    }
  });
})();
