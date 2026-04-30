require("dotenv").config();
const { connectDb } = require("./config/db");
const Product = require("./models/Product");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/maaza_db";

const seedProducts = [
  {
    name: "Oversize Erkek Siyah Tişort",
    category: "Erkek Tişort",
    price: 350,
    oldPrice: 400,
    image: "/images/oversize erkek tişort.jpg",
    stock: 35,
    status: "Aktif"
  },
  {
    name: "Keten Erkek Beyaz Gömlek",
    category: "Erkek Gömlek",
    price: 600,
    oldPrice: 650,
    image: "/images/Erkek Beyaz Keten Gömlek.jpg",
    stock: 24,
    status: "Aktif"
  },
  {
    name: "Erkek Siyah Kot Pantolon",
    category: "Erkek Pantolon",
    price: 600,
    oldPrice: 700,
    image: "/images/Erkek Siyah Kot Pantolon.webp",
    stock: 16,
    status: "Aktif"
  }
];

connectDb(MONGODB_URI)
  .then(async () => {
    await Product.deleteMany({});
    await Product.insertMany(seedProducts);
    console.log("Seed tamamlandı.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
