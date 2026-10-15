require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/product.model");

const sampleProducts = [
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation and 30-hour battery life.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
    stock: 25,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with tactile blue switches and detachable USB-C cable.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60",
    stock: 10,
  },
  {
    name: "Smartphone Stand & Charger",
    description: "Fast wireless charging stand compatible with iOS and Android devices.",
    price: 1299,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&auto=format&fit=crop&q=60",
    stock: 45,
  },
  {
    name: "Classic Denim Jacket",
    description: "Premium cotton denim jacket with button closure and relaxed fit for all seasons.",
    price: 3499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60",
    stock: 15,
  },
  {
    name: "Canvas Minimalist Sneakers",
    description: "Lightweight, breathable canvas sneakers suitable for daily casual wear.",
    price: 1999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&auto=format&fit=crop&q=60",
    stock: 8,
  },
  {
    name: "Clean Code Handbook",
    description: "A handbook of agile software craftsmanship for writing better, cleaner code.",
    price: 899,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60",
    stock: 50,
  },
  {
    name: "Ergonomic Desk Chair",
    description: "Mesh office chair with adjustable lumbar support and 360-degree swivel.",
    price: 7999,
    category: "Home",
    image: "https://images.unsplash.com/photo-1580481072645-022f9a6d1200?w=500&auto=format&fit=crop&q=60",
    stock: 5,
  },
  {
    name: "Ceramic Coffee Mug Set",
    description: "Set of 4 matte ceramic coffee mugs, microwave and dishwasher safe.",
    price: 799,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60",
    stock: 0,
  },
];

async function seedDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("MONGODB_URI environment variable is not defined");
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    await Product.deleteMany({});
    console.log("Cleared existing products.");

    const created = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${created.length} products!`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDB();
}

module.exports = seedDB;
