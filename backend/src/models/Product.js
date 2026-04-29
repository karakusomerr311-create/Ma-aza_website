const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0 },
    image: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, enum: ["Aktif", "Pasif"], default: "Aktif" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
