(function () {
  const USERS_KEY = "shopUsers";
  const SESSION_KEY = "shopSession";
  const ADMIN_EMAIL = "admin@gmail.com";

  function hashPassword(password) {
    return btoa(unescape(encodeURIComponent(password)));
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function ensureUserRoles() {
    var users = getUsers();
    var changed = false;
    users.forEach(function (u) {
      if (!u.role) {
        u.role = "user";
        changed = true;
      }
    });
    if (changed) saveUsers(users);
  }

  function ensureDefaultAdmin() {
    var users = getUsers();
    var changed = false;
    users.forEach(function (u) {
      if (u.email !== ADMIN_EMAIL && u.role === "admin") {
        u.role = "user";
        changed = true;
      }
    });
    var hasAdmin = users.some(function (u) {
      return u.email === ADMIN_EMAIL;
    });
    if (!hasAdmin) {
      users.push({
        email: ADMIN_EMAIL,
        passwordHash: hashPassword("admin123"),
        role: "admin",
      });
      changed = true;
    }
    if (changed) saveUsers(users);
  }

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

  function registerUser(email, password) {
    var normalized = (email || "").trim().toLowerCase();
    if (normalized === ADMIN_EMAIL) {
      return {
        ok: false,
        error:
          "Bu e-posta yönetici hesabı için ayrılmıştır; buradan kayıt olunamaz.",
      };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return { ok: false, error: "Geçerli bir e-posta adresi girin." };
    }
    if (!password || password.length < 6) {
      return { ok: false, error: "Şifre en az 6 karakter olmalıdır." };
    }
    var users = getUsers();
    if (
      users.some(function (u) {
        return u.email === normalized;
      })
    ) {
      return { ok: false, error: "Bu e-posta ile zaten kayıt var." };
    }
    users.push({
      email: normalized,
      passwordHash: hashPassword(password),
      role: "user",
    });
    saveUsers(users);
    return { ok: true };
  }

  function loginUser(email, password) {
    var normalized = (email || "").trim().toLowerCase();
    if (normalized === ADMIN_EMAIL) {
      return {
        ok: false,
        error:
          "Yönetici hesabı için müşteri girişi kullanılamaz. Yönetici giriş sayfasına gidin.",
      };
    }
    var users = getUsers();
    var user = users.find(function (u) {
      return u.email === normalized;
    });
    if (!user) {
      return {
        ok: false,
        error:
          "Bu e-posta ile kayıt bulunamadı. Önce kayıt olun, ardından giriş yapın.",
      };
    }
    if (user.passwordHash !== hashPassword(password)) {
      return { ok: false, error: "Şifre yanlış." };
    }
    setSession(normalized, "user");
    return { ok: true };
  }

  function loginAdmin(email, password) {
    var normalized = (email || "").trim().toLowerCase();
    if (normalized !== ADMIN_EMAIL) {
      return { ok: false, error: "Bu sayfa sadece yönetici hesabı içindir." };
    }
    var users = getUsers();
    var user = users.find(function (u) {
      return u.email === normalized;
    });
    if (!user) {
      return { ok: false, error: "Yönetici hesabı bulunamadı." };
    }
    if (user.passwordHash !== hashPassword(password)) {
      return { ok: false, error: "Şifre yanlış." };
    }
    setSession(normalized, "admin");
    return { ok: true };
  }

  function logout() {
    clearSession();
  }

  ensureUserRoles();
  ensureDefaultAdmin();

  window.shopAuth = {
    ADMIN_EMAIL: ADMIN_EMAIL,
    hashPassword: hashPassword,
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
