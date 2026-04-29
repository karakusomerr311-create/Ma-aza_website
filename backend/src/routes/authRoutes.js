const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: "Geçerli bir e-posta adresi girin." });
    }
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: "Şifre en az 6 karakter olmalıdır." });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ ok: false, error: "Bu e-posta ile zaten kayıt var." });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role: "user" });
    return res.json({ ok: true, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Kayıt sırasında hata oluştu." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ ok: false, error: "Bu e-posta ile kayıt bulunamadı." });
    }
    const passOk = await bcrypt.compare(password, user.passwordHash);
    if (!passOk) {
      return res.status(400).json({ ok: false, error: "Şifre yanlış." });
    }
    return res.json({
      ok: true,
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Giriş sırasında hata oluştu." });
  }
});

module.exports = router;
