require("dotenv").config();
const { connectDb } = require("./config/db");
const Product = require("./models/Product");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/maaza_db";

const products = [
  {
    name: "Oversize Erkek Beyaz Tişört",
    category: "Erkek Tişort",
    price: 349,
    oldPrice: 399,
    image: "/images/Oversize Erkek Beyaz Ti�ort.jpg",
    stock: 28,
    status: "Aktif"
  },
  {
    name: "Oversize Erkek Gri Tişört",
    category: "Erkek Tişort",
    price: 349,
    oldPrice: 399,
    image: "/images/Oversize Erkek Gri Ti�ort.jpg",
    stock: 22,
    status: "Aktif"
  },
  {
    name: "Erkek Kot Pantolon",
    category: "Erkek Pantolon",
    price: 599,
    oldPrice: 699,
    image: "/images/Erkek Kot Pantolon.webp",
    stock: 18,
    status: "Aktif"
  },
  {
    name: "Erkek Bej Pantolon",
    category: "Erkek Pantolon",
    price: 549,
    oldPrice: 649,
    image: "/images/erkek bej bantolon.webp",
    stock: 20,
    status: "Aktif"
  },
  {
    name: "Erkek Beyaz Pantolon",
    category: "Erkek Pantolon",
    price: 549,
    oldPrice: 649,
    image: "/images/erkek beyaz bantolon.webp",
    stock: 14,
    status: "Aktif"
  },
  {
    name: "Erkek Siyah Pantolon",
    category: "Erkek Pantolon",
    price: 549,
    oldPrice: 649,
    image: "/images/erkek siyah bantolon.webp",
    stock: 19,
    status: "Aktif"
  },
  {
    name: "Erkek Kahverengi Pantolon",
    category: "Erkek Pantolon",
    price: 549,
    oldPrice: 649,
    image: "/images/erkek kahverengi bantolon.webp",
    stock: 12,
    status: "Aktif"
  },
  {
    name: "Erkek Gri Kot Pantolon",
    category: "Erkek Pantolon",
    price: 599,
    oldPrice: 699,
    image: "/images/Erkek Gri Kot Psntolon.webp",
    stock: 10,
    status: "Aktif"
  },
  {
    name: "Erkek Buz Mavisi Pantolon",
    category: "Erkek Pantolon",
    price: 629,
    oldPrice: 729,
    image: "/images/Erkek Buz mavisi Pantolon.webp",
    stock: 9,
    status: "Aktif"
  },
  {
    name: "Erkek Buz Mavisi Ceket",
    category: "Erkek Ceket",
    price: 899,
    oldPrice: 999,
    image: "/images/Erkek Buz Mavisi Ceket.webp",
    stock: 7,
    status: "Aktif"
  },
  {
    name: "Erkek Siyah Kot Ceket",
    category: "Erkek Ceket",
    price: 849,
    oldPrice: 949,
    image: "/images/erkek siyah kot ceket.webp",
    stock: 8,
    status: "Aktif"
  },
  {
    name: "Erkek Yeşil Kot Ceket",
    category: "Erkek Ceket",
    price: 849,
    oldPrice: 949,
    image: "/images/erkek ye�il kot ceket.webp",
    stock: 8,
    status: "Aktif"
  },
  {
    name: "Erkek Bej Kazak",
    category: "Erkek Kazak",
    price: 499,
    oldPrice: 599,
    image: "/images/erkek bej kazak.webp",
    stock: 16,
    status: "Aktif"
  },
  {
    name: "Erkek Gri Kazak",
    category: "Erkek Kazak",
    price: 499,
    oldPrice: 599,
    image: "/images/erkek gri kazak.webp",
    stock: 15,
    status: "Aktif"
  },
  {
    name: "Erkek Siyah Kazak",
    category: "Erkek Kazak",
    price: 499,
    oldPrice: 599,
    image: "/images/erkek siyah kazak.webp",
    stock: 13,
    status: "Aktif"
  },
  {
    name: "Erkek Yeşil Kazak",
    category: "Erkek Kazak",
    price: 499,
    oldPrice: 599,
    image: "/images/erkek ye�il kazak.webp",
    stock: 11,
    status: "Aktif"
  },
  {
    name: "Erkek Deri Siyah Kemer",
    category: "Aksesuar",
    price: 249,
    oldPrice: 299,
    image: "/images/Erkek Deri Siyah Kemer.webp",
    stock: 40,
    status: "Aktif"
  },
  {
    name: "Erkek 3.5 Cm Kahverengi Kemer",
    category: "Aksesuar",
    price: 249,
    oldPrice: 299,
    image: "/images/Erkek 3.5 Cm Kahverengi Kemer.webp",
    stock: 34,
    status: "Aktif"
  },
  {
    name: "3.5 Cm Koyu Bej Kemer",
    category: "Aksesuar",
    price: 239,
    oldPrice: 289,
    image: "/images/3.5 Cm Koyu Bej Kemer.webp",
    stock: 29,
    status: "Aktif"
  },
  {
    name: "Erkek Deri Bileklik",
    category: "Aksesuar",
    price: 199,
    oldPrice: 249,
    image: "/images/Erkek Deri Bileklik.webp",
    stock: 50,
    status: "Aktif"
  },
  {
    name: "Unisex Siyah Spor Ayakkabı",
    category: "Ayakkabı",
    price: 999,
    oldPrice: 1199,
    image: "/images/Unisex Siyah Spor Ayakkab�.webp",
    stock: 12,
    status: "Aktif"
  },
  {
    name: "Erkek Yüksek Tabanlı Bot",
    category: "Ayakkabı",
    price: 1299,
    oldPrice: 1499,
    image: "/images/Erkek Siyah Y�ksek Tabanl� Bot.webp",
    stock: 9,
    status: "Aktif"
  }
];

async function run() {
  await connectDb(MONGODB_URI);

  const ops = products.map((p) => ({
    updateOne: {
      filter: { name: p.name },
      update: { $setOnInsert: p },
      upsert: true
    }
  }));

  const result = await Product.bulkWrite(ops, { ordered: false });
  const inserted =
    (result.upsertedCount || 0) +
    (result.insertedCount || 0) +
    (result.nUpserted || 0);

  console.log(`Seed ürün: eklendi=${inserted}, toplam işlem=${products.length}`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

