const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  const users = await User.find({}, { email: 1, role: 1 }).sort({ createdAt: -1 });
  return res.json({ ok: true, users });
});

module.exports = router;
