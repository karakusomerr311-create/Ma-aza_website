const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res) => {
  const products = await Product.find({ status: "Aktif" }).sort({ createdAt: -1 });
  return res.json({ ok: true, products });
});

router.get("/admin/all", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  return res.json({ ok: true, products });
});

router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    const created = await Product.create(payload);
    return res.json({ ok: true, product: created });
  } catch (e) {
    return res.status(400).json({ ok: false, error: "Ürün eklenemedi." });
  }
});

router.patch("/:id/stock", async (req, res) => {
  const stock = Number(req.body.stock);
  if (Number.isNaN(stock) || stock < 0) {
    return res.status(400).json({ ok: false, error: "Geçerli stok değeri girin." });
  }
  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    { stock },
    { new: true }
  );
  if (!updated) return res.status(404).json({ ok: false, error: "Ürün bulunamadı." });
  return res.json({ ok: true, product: updated });
});

module.exports = router;
