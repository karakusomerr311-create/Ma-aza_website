require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const { connectDb } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/maaza_db";

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);

app.use("/css", express.static(path.join(process.cwd(), "css")));
app.use("/js", express.static(path.join(process.cwd(), "js")));
app.use("/images", express.static(path.join(process.cwd(), "images")));
app.use("/html", express.static(path.join(process.cwd(), "html")));
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "index.html"));
});

async function ensureDefaultAdmin() {
  const email = "admin@gmail.com";
  const existing = await User.findOne({ email });
  if (existing) return;
  const passwordHash = await bcrypt.hash("admin123", 10);
  await User.create({ email, passwordHash, role: "admin" });
}

connectDb(MONGODB_URI)
  .then(async () => {
    await ensureDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err.message);
    process.exit(1);
  });
