/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║              TradeSphere — Full Test Data Seeder                    ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  Usage:  node seed-test.js                                          ║
 * ║          node seed-test.js --fresh   (wipes all data first)         ║
 * ║                                                                     ║
 * ║  Seeds:                                                             ║
 * ║    • 1 Admin                                                        ║
 * ║    • 3 Buyers  (with wallets, addresses)                            ║
 * ║    • 2 Vendors (with shops, products, images)                       ║
 * ║    • 1 Delivery employee                                            ║
 * ║    • 5 Categories (nested hierarchy)                                ║
 * ║    • 10 Products across vendors & categories                        ║
 * ║    • Orders in various statuses                                     ║
 * ║    • Ratings on products and vendors                                ║
 * ║    • Coupons                                                        ║
 * ║    • Wallet transactions                                            ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import mongoose from "mongoose";
import bcrypt from "bcrypt";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isFresh = process.argv.includes("--fresh");
const hash = (pw) => bcrypt.hash(pw, 10);
const slug = (s) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const orderNum = () => `ORD-${Date.now()}-${rand(1000, 9999)}`;

// ─── Inline Schemas (mirrors your actual models exactly) ──────────────────────

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: String,
    role: { type: String, enum: ["BUYER", "VENDOR", "EMPLOYEE", "ADMIN"], default: "BUYER" },
    isB2B: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    refreshToken: String,
    passwordResetToken: String,
    passwordResetExpiry: Date,
    lastLoginAt: Date,
  },
  { timestamps: true }
);

const VendorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendorType: { type: String, enum: ["SOLO", "ORGANIZATION"], default: "SOLO" },
    shopName: String,
    businessType: String,
    panNumber: String,
    gstNumber: { type: String, default: null },
    orgOwnerName: { type: String, default: null },
    orgOwnerPhone: { type: String, default: null },
    businessAddresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    shopLocation: { lat: { type: Number, default: null }, lng: { type: Number, default: null } },
    deliveryRadiusKm: { type: Number, default: 10 },
    freeDeliveryDistanceKm: { type: Number, default: 0 },
    deliveryChargePerKm: { type: Number, default: 5 },
    totalOrders: { type: Number, default: 0 },
    deliverySpeedScore: { type: Number, default: 8 },
    orderSuccessRate: { type: Number, default: 95 },
    cancelRate: { type: Number, default: 2 },
    returnRate: { type: Number, default: 1 },
    vendorScore: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true, lowercase: true },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    level: Number,
    isLeaf: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    title: String,
    slug: String,
    description: String,
    price: Number,
    stock: Number,
    saleType: { type: String, enum: ["B2C", "B2B", "BOTH"], default: "B2C" },
    minOrderQty: { type: Number, default: 1 },
    maxOrderQty: Number,
    gstRequired: { type: Boolean, default: false },
    bulkDiscountEnabled: { type: Boolean, default: false },
    minDeliveryDays: Number,
    maxDeliveryDays: Number,
    manufacturingDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    hasExpiry: { type: Boolean, default: false },
    clothingSizes: { type: [String], default: [] },
    productStandards: { type: mongoose.Schema.Types.Mixed, default: {} },
    productCategory: { type: String, default: "GENERAL" },
    aiScore: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    approvalStatus: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    adminRemark: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductImageSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    imageUrl: String,
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AddressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    addressType: { type: String, enum: ["HOME", "SHOP", "WAREHOUSE"], default: "HOME" },
    country: String,
    state: String,
    city: String,
    area: String,
    pincode: String,
    buildingNameOrNumber: String,
    landmark: String,
    location: { lat: Number, lng: Number },
  },
  { timestamps: true }
);

const TradeWalletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0 },
    locked: { type: Number, default: 0 },
    withdrawn: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const WalletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["CREDIT", "DEBIT", "LOCK", "UNLOCK", "REFUND", "WITHDRAWAL"] },
    amount: Number,
    description: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], default: "COMPLETED" },
  },
  { timestamps: true }
);

const deliveryTrackingSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["ORDER_PLACED","PAYMENT_CONFIRMED","PROCESSING","PACKED","PICKED_UP",
             "IN_TRANSIT","OUT_FOR_DELIVERY","DELIVERED","FAILED_DELIVERY",
             "RETURN_INITIATED","RETURN_PICKED_UP","RETURNED"],
    },
    message: String,
    location: String,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    vendorId:  { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    quantity: Number,
    priceAtPurchase: Number,
    status: {
      type: String,
      enum: ["PENDING","PACKED","PICKED_UP","SHIPPED","OUT_FOR_DELIVERY",
             "DELIVERED","CANCELLED","RETURN_REQUESTED","RETURNED","REFUNDED"],
      default: "PENDING",
    },
    deliveredAt: Date,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [orderItemSchema],
    totalAmount: Number,
    deliveryAddress: {
      name: String, phone: String, street: String, area: String,
      city: String, state: String, pincode: String, lat: Number, lng: Number,
    },
    deliveryTracking: [deliveryTrackingSchema],
    estimatedDeliveryDate: Date,
    orderStatus: {
      type: String,
      enum: ["PENDING_PAYMENT","CONFIRMED","PROCESSING","PACKED","PICKED_UP","SHIPPED",
             "OUT_FOR_DELIVERY","DELIVERED","COMPLETED","CANCELLED","RETURN_REQUESTED",
             "RETURNED","REFUNDED"],
      default: "PENDING_PAYMENT",
    },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    paymentMethod: { type: String, enum: ["TRADE_WALLET", "COD"], default: "TRADE_WALLET" },
    orderNumber: String,
    paymentStatus: { type: String, enum: ["PENDING","PAID","FAILED","REFUNDED"], default: "PENDING" },
    cancelledAt: Date,
    returnWindowEndsAt: Date,
  },
  { timestamps: true }
);

const RatingSchema = new mongoose.Schema(
  {
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewerName: String,
    targetType: { type: String, enum: ["PRODUCT", "VENDOR", "BUYER"], required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    vendorId:  { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    buyerId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    stars: { type: Number, min: 1, max: 5 },
    review: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
    discountType: { type: String, enum: ["PERCENT", "FLAT"] },
    discountValue: Number,
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Register Models ───────────────────────────────────────────────────────────

const User              = mongoose.models.User              || mongoose.model("User", UserSchema);
const Vendor            = mongoose.models.Vendor            || mongoose.model("Vendor", VendorSchema);
const Category          = mongoose.models.Category          || mongoose.model("Category", CategorySchema);
const Product           = mongoose.models.Product           || mongoose.model("Product", ProductSchema);
const ProductImage      = mongoose.models.ProductImage      || mongoose.model("ProductImage", ProductImageSchema);
const Address           = mongoose.models.Address           || mongoose.model("Address", AddressSchema);
const TradeWallet       = mongoose.models.TradeWallet       || mongoose.model("TradeWallet", TradeWalletSchema);
const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model("WalletTransaction", WalletTransactionSchema);
const Order             = mongoose.models.Order             || mongoose.model("Order", OrderSchema);
const Rating            = mongoose.models.Rating            || mongoose.model("Rating", RatingSchema);
const Coupon            = mongoose.models.Coupon            || mongoose.model("Coupon", CouponSchema);

// ─── Seed Data Definitions ────────────────────────────────────────────────────

const PLACEHOLDER_IMAGES = [
  "https://placehold.co/600x400/e2e8f0/475569?text=Product+1",
  "https://placehold.co/600x400/fce7f3/9d174d?text=Product+2",
  "https://placehold.co/600x400/d1fae5/065f46?text=Product+3",
  "https://placehold.co/600x400/dbeafe/1e40af?text=Product+4",
  "https://placehold.co/600x400/fef3c7/92400e?text=Product+5",
];

const PRODUCT_REVIEWS = [
  "Excellent quality, very satisfied!",
  "Good product but delivery was slow.",
  "Exactly as described. Would buy again.",
  "Great value for money.",
  "Packaging could be better but product is good.",
  "Fast delivery, product is as expected.",
  "Highly recommend this to everyone.",
  "Not bad, but expected better quality.",
];

// ─── Main Seeder ──────────────────────────────────────────────────────────────

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("❌  MONGODB_URI is not set in .env");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅  Connected\n");

  // ── Optionally wipe everything ─────────────────────────────────────────────
  if (isFresh) {
    console.log("🧹  --fresh flag detected. Wiping existing test data...");
    await Promise.all([
      User.deleteMany({}), Vendor.deleteMany({}), Category.deleteMany({}),
      Product.deleteMany({}), ProductImage.deleteMany({}), Address.deleteMany({}),
      TradeWallet.deleteMany({}), WalletTransaction.deleteMany({}),
      Order.deleteMany({}), Rating.deleteMany({}), Coupon.deleteMany({}),
    ]);
    console.log("✅  Database cleared\n");
  }

  // ══════════════════════════════════════════════════════════════════
  // 1. USERS
  // ══════════════════════════════════════════════════════════════════
  console.log("👤  Creating users...");

  const adminPw   = await hash("Admin@123");
  const buyerPw   = await hash("Buyer@123");
  const vendorPw  = await hash("Vendor@123");
  const delivPw   = await hash("Delivery@123");

  const [admin, buyer1, buyer2, buyer3, vendorUser1, vendorUser2, deliveryUser] =
    await User.insertMany([
      {
        name: "TradeSphere Admin",
        email: "admin@tradesphere.com",
        password: adminPw,
        role: "ADMIN",
        isEmailVerified: true,
        isActive: true,
      },
      {
        name: "Rahul Sharma",
        email: "buyer1@tradesphere.com",
        phone: "9876543210",
        password: buyerPw,
        role: "BUYER",
        isEmailVerified: true,
        isActive: true,
      },
      {
        name: "Priya Mehta",
        email: "buyer2@tradesphere.com",
        phone: "9876543211",
        password: buyerPw,
        role: "BUYER",
        isEmailVerified: true,
        isActive: true,
      },
      {
        name: "Anil Gupta",
        email: "buyer3@tradesphere.com",
        phone: "9876543212",
        password: buyerPw,
        role: "BUYER",
        isEmailVerified: true,
        isActive: true,
      },
      {
        name: "Suresh Patel",
        email: "vendor1@tradesphere.com",
        phone: "9876543213",
        password: vendorPw,
        role: "VENDOR",
        isEmailVerified: true,
        isActive: true,
      },
      {
        name: "Kavita Electronics",
        email: "vendor2@tradesphere.com",
        phone: "9876543214",
        password: vendorPw,
        role: "VENDOR",
        isEmailVerified: true,
        isActive: true,
      },
      {
        name: "Ravi Kumar",
        email: "delivery@tradesphere.com",
        phone: "9876543215",
        password: delivPw,
        role: "EMPLOYEE",
        isEmailVerified: true,
        isActive: true,
      },
    ]);

  console.log(`   ✓ ${7} users created`);

  // ══════════════════════════════════════════════════════════════════
  // 2. ADDRESSES
  // ══════════════════════════════════════════════════════════════════
  console.log("📍  Creating addresses...");

  const addresses = await Address.insertMany([
    // Buyer 1 home
    {
      userId: buyer1._id, addressType: "HOME",
      country: "India", state: "Gujarat", city: "Ahmedabad",
      area: "Vastrapur", pincode: "380015",
      buildingNameOrNumber: "B-204, Silver Oak Apartments",
      landmark: "Near Vastrapur Lake",
      location: { lat: 23.0469, lng: 72.5311 },
    },
    // Buyer 2 home
    {
      userId: buyer2._id, addressType: "HOME",
      country: "India", state: "Maharashtra", city: "Mumbai",
      area: "Andheri West", pincode: "400058",
      buildingNameOrNumber: "12, Sunrise CHS",
      landmark: "Near D-Mart",
      location: { lat: 19.1364, lng: 72.8296 },
    },
    // Buyer 3 home
    {
      userId: buyer3._id, addressType: "HOME",
      country: "India", state: "Karnataka", city: "Bengaluru",
      area: "Koramangala", pincode: "560034",
      buildingNameOrNumber: "45, 5th Block",
      landmark: "Near Sony World Junction",
      location: { lat: 12.9279, lng: 77.6271 },
    },
    // Vendor 1 shop
    {
      userId: vendorUser1._id, addressType: "SHOP",
      country: "India", state: "Gujarat", city: "Surat",
      area: "Ring Road", pincode: "395002",
      buildingNameOrNumber: "Shop No. 7, Textile Market",
      landmark: "Opp. Surat Railway Station",
      location: { lat: 21.1702, lng: 72.8311 },
    },
    // Vendor 2 shop
    {
      userId: vendorUser2._id, addressType: "SHOP",
      country: "India", state: "Delhi", city: "New Delhi",
      area: "Nehru Place", pincode: "110019",
      buildingNameOrNumber: "G-12, Electronics Market",
      landmark: "Near Metro Station",
      location: { lat: 28.5494, lng: 77.2515 },
    },
  ]);

  console.log(`   ✓ ${addresses.length} addresses created`);

  // ══════════════════════════════════════════════════════════════════
  // 3. VENDORS
  // ══════════════════════════════════════════════════════════════════
  console.log("🏪  Creating vendor profiles...");

  const [vendor1, vendor2] = await Vendor.insertMany([
    {
      userId: vendorUser1._id,
      vendorType: "SOLO",
      shopName: "Patel Textiles",
      businessType: "Retail",
      panNumber: "ABCPT1234E",
      gstNumber: "24ABCPT1234E1Z5",
      businessAddresses: [addresses[3]._id],
      shopLocation: { lat: 21.1702, lng: 72.8311 },
      deliveryRadiusKm: 50,
      freeDeliveryDistanceKm: 5,
      deliveryChargePerKm: 5,
      deliverySpeedScore: 8,
      orderSuccessRate: 95,
      cancelRate: 2,
      returnRate: 1,
      vendorScore: 92,
      totalOrders: 340,
      isActive: true,
    },
    {
      userId: vendorUser2._id,
      vendorType: "ORGANIZATION",
      shopName: "Kavita Electronics Hub",
      businessType: "Electronics Retail",
      panNumber: "XYZKE5678F",
      gstNumber: "07XYZKE5678F1Z3",
      orgOwnerName: "Kavita Sharma",
      orgOwnerPhone: "9876543214",
      businessAddresses: [addresses[4]._id],
      shopLocation: { lat: 28.5494, lng: 77.2515 },
      deliveryRadiusKm: 30,
      freeDeliveryDistanceKm: 3,
      deliveryChargePerKm: 8,
      deliverySpeedScore: 9,
      orderSuccessRate: 98,
      cancelRate: 1,
      returnRate: 0,
      vendorScore: 97,
      totalOrders: 820,
      isActive: true,
    },
  ]);

  console.log(`   ✓ 2 vendor profiles created`);

  // ══════════════════════════════════════════════════════════════════
  // 4. CATEGORIES (hierarchy)
  // ══════════════════════════════════════════════════════════════════
  console.log("📂  Creating categories...");

  const [catClothing, catElectronics, catFood] = await Category.insertMany([
    { name: "Clothing", slug: "clothing", level: 1, isLeaf: false, isActive: true },
    { name: "Electronics", slug: "electronics", level: 1, isLeaf: false, isActive: true },
    { name: "Food & Grocery", slug: "food-grocery", level: 1, isLeaf: false, isActive: true },
  ]);

  const [catMenWear, catWomenWear, catMobiles, catLaptops, catSnacks] = await Category.insertMany([
    { name: "Men's Wear", slug: "mens-wear", parentCategory: catClothing._id, level: 2, isLeaf: true, isActive: true },
    { name: "Women's Wear", slug: "womens-wear", parentCategory: catClothing._id, level: 2, isLeaf: true, isActive: true },
    { name: "Mobile Phones", slug: "mobile-phones", parentCategory: catElectronics._id, level: 2, isLeaf: true, isActive: true },
    { name: "Laptops", slug: "laptops", parentCategory: catElectronics._id, level: 2, isLeaf: true, isActive: true },
    { name: "Snacks & Beverages", slug: "snacks-beverages", parentCategory: catFood._id, level: 2, isLeaf: true, isActive: true },
  ]);

  console.log(`   ✓ 8 categories created (3 parent + 5 leaf)`);

  // ══════════════════════════════════════════════════════════════════
  // 5. PRODUCTS
  // ══════════════════════════════════════════════════════════════════
  console.log("📦  Creating products...");

  const productDefs = [
    // Vendor 1 — Textiles
    {
      vendorId: vendor1._id, categoryId: catMenWear._id,
      title: "Classic Cotton Kurta",
      description: "Pure cotton kurta, comfortable for all seasons. Available in multiple sizes.",
      price: 699, stock: 120,
      saleType: "B2C", productCategory: "CLOTHING",
      clothingSizes: ["S", "M", "L", "XL", "XXL"],
      minDeliveryDays: 3, maxDeliveryDays: 7,
      aiScore: 82, isApproved: true, approvalStatus: "APPROVED",
    },
    {
      vendorId: vendor1._id, categoryId: catWomenWear._id,
      title: "Silk Saree — Banarasi",
      description: "Authentic Banarasi silk saree with golden zari work. Perfect for festive occasions.",
      price: 4999, stock: 40,
      saleType: "BOTH", productCategory: "CLOTHING",
      clothingSizes: ["FREE SIZE"],
      minDeliveryDays: 4, maxDeliveryDays: 8,
      aiScore: 91, isApproved: true, approvalStatus: "APPROVED",
    },
    {
      vendorId: vendor1._id, categoryId: catMenWear._id,
      title: "Denim Jeans Slim Fit",
      description: "Stylish slim-fit denim jeans. High durability fabric with stretch comfort.",
      price: 1299, stock: 85,
      saleType: "B2C", productCategory: "CLOTHING",
      clothingSizes: ["28", "30", "32", "34", "36"],
      minDeliveryDays: 3, maxDeliveryDays: 6,
      aiScore: 78, isApproved: true, approvalStatus: "APPROVED",
    },
    {
      vendorId: vendor1._id, categoryId: catWomenWear._id,
      title: "Anarkali Suit Set",
      description: "Elegant Anarkali suit with dupatta. Fully stitched and ready to wear.",
      price: 2199, stock: 60,
      saleType: "B2C", productCategory: "CLOTHING",
      clothingSizes: ["S", "M", "L", "XL"],
      minDeliveryDays: 3, maxDeliveryDays: 7,
      aiScore: 85, isApproved: true, approvalStatus: "APPROVED",
    },
    // Vendor 2 — Electronics
    {
      vendorId: vendor2._id, categoryId: catMobiles._id,
      title: "Smartphone Pro 5G — 128GB",
      description: "Latest 5G smartphone with 6.7\" AMOLED display, 50MP camera, 5000mAh battery.",
      price: 22999, stock: 30,
      saleType: "BOTH", productCategory: "ELECTRONICS",
      minDeliveryDays: 2, maxDeliveryDays: 5,
      aiScore: 95, isApproved: true, approvalStatus: "APPROVED",
    },
    {
      vendorId: vendor2._id, categoryId: catMobiles._id,
      title: "Budget Phone 4G — 64GB",
      description: "Affordable 4G smartphone with long battery life and decent camera performance.",
      price: 8499, stock: 55,
      saleType: "B2C", productCategory: "ELECTRONICS",
      minDeliveryDays: 2, maxDeliveryDays: 4,
      aiScore: 72, isApproved: true, approvalStatus: "APPROVED",
    },
    {
      vendorId: vendor2._id, categoryId: catLaptops._id,
      title: "UltraBook 15 Pro",
      description: "Thin and light laptop with Intel Core i7, 16GB RAM, 512GB SSD. Ideal for professionals.",
      price: 68999, stock: 15,
      saleType: "BOTH", productCategory: "ELECTRONICS",
      bulkDiscountEnabled: true, gstRequired: true,
      minDeliveryDays: 3, maxDeliveryDays: 6,
      aiScore: 96, isApproved: true, approvalStatus: "APPROVED",
    },
    {
      vendorId: vendor2._id, categoryId: catLaptops._id,
      title: "Student Laptop 14\"",
      description: "Budget-friendly laptop for students. 8GB RAM, 256GB SSD, Windows 11 Home.",
      price: 34999, stock: 25,
      saleType: "B2C", productCategory: "ELECTRONICS",
      minDeliveryDays: 2, maxDeliveryDays: 5,
      aiScore: 80, isApproved: true, approvalStatus: "APPROVED",
    },
    {
      vendorId: vendor2._id, categoryId: catMobiles._id,
      title: "TWS Earbuds Pro",
      description: "True wireless earbuds with ANC, 30hr battery, IPX5 water resistance.",
      price: 3499, stock: 100,
      saleType: "B2C", productCategory: "ELECTRONICS",
      minDeliveryDays: 1, maxDeliveryDays: 3,
      aiScore: 88, isApproved: true, approvalStatus: "APPROVED",
    },
    // Pending product
    {
      vendorId: vendor1._id, categoryId: catMenWear._id,
      title: "Linen Shirt (Summer Collection)",
      description: "Light and breathable linen shirt perfect for summer.",
      price: 899, stock: 200,
      saleType: "B2C", productCategory: "CLOTHING",
      clothingSizes: ["S", "M", "L", "XL"],
      minDeliveryDays: 3, maxDeliveryDays: 7,
      aiScore: 70, isApproved: false, approvalStatus: "PENDING",
    },
  ];

  const products = await Product.insertMany(
    productDefs.map((p) => ({ ...p, slug: slug(p.title) }))
  );

  console.log(`   ✓ ${products.length} products created (9 approved, 1 pending)`);

  // ── Product Images ────────────────────────────────────────────────
  const imageInserts = products.flatMap((p, i) => [
    { productId: p._id, imageUrl: PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length], isPrimary: true, order: 0 },
    { productId: p._id, imageUrl: PLACEHOLDER_IMAGES[(i + 1) % PLACEHOLDER_IMAGES.length], isPrimary: false, order: 1 },
  ]);
  await ProductImage.insertMany(imageInserts);
  console.log(`   ✓ ${imageInserts.length} product images added`);

  // ══════════════════════════════════════════════════════════════════
  // 6. WALLETS
  // ══════════════════════════════════════════════════════════════════
  console.log("💰  Creating wallets...");

  const allUsers = [admin, buyer1, buyer2, buyer3, vendorUser1, vendorUser2, deliveryUser];
  const walletBalances = { // userId string → balance
    [buyer1._id]: 5000,
    [buyer2._id]: 12500,
    [buyer3._id]: 2200,
    [vendorUser1._id]: 38000,
    [vendorUser2._id]: 95000,
    [admin._id]: 0,
    [deliveryUser._id]: 1800,
  };

  await TradeWallet.insertMany(
    allUsers.map((u) => ({
      userId: u._id,
      balance: walletBalances[u._id] ?? 0,
      locked: 0,
      withdrawn: 0,
    }))
  );

  // Wallet credit transactions for buyers
  await WalletTransaction.insertMany([
    { userId: buyer1._id, type: "CREDIT", amount: 5000, description: "Wallet top-up via UPI", status: "COMPLETED" },
    { userId: buyer2._id, type: "CREDIT", amount: 10000, description: "Wallet top-up via Bank Transfer", status: "COMPLETED" },
    { userId: buyer2._id, type: "CREDIT", amount: 2500, description: "Referral bonus", status: "COMPLETED" },
    { userId: buyer3._id, type: "CREDIT", amount: 2200, description: "Wallet top-up via UPI", status: "COMPLETED" },
    { userId: vendorUser1._id, type: "CREDIT", amount: 38000, description: "Order earnings credited", status: "COMPLETED" },
    { userId: vendorUser2._id, type: "CREDIT", amount: 95000, description: "Order earnings credited", status: "COMPLETED" },
  ]);

  console.log(`   ✓ ${allUsers.length} wallets + transactions created`);

  // ══════════════════════════════════════════════════════════════════
  // 7. ORDERS
  // ══════════════════════════════════════════════════════════════════
  console.log("🛒  Creating orders...");

  const deliveryAddr = (buyer, addr) => ({
    name: buyer.name,
    phone: addr.location ? "9876543210" : "9876543211",
    street: addr.buildingNameOrNumber,
    area: addr.area,
    city: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    lat: addr.location?.lat,
    lng: addr.location?.lng,
  });

  const approvedProducts = products.filter((p) => p.approvalStatus === "APPROVED");

  const orders = await Order.insertMany([
    // Order 1 — Delivered (buyer1)
    {
      buyerId: buyer1._id,
      items: [
        { productId: approvedProducts[0]._id, vendorId: vendor1._id, quantity: 2, priceAtPurchase: 699, status: "DELIVERED", deliveredAt: new Date(Date.now() - 3 * 86400000) },
        { productId: approvedProducts[2]._id, vendorId: vendor1._id, quantity: 1, priceAtPurchase: 1299, status: "DELIVERED", deliveredAt: new Date(Date.now() - 3 * 86400000) },
      ],
      totalAmount: 2697,
      deliveryAddress: deliveryAddr(buyer1, addresses[0]),
      deliveryTracking: [
        { status: "ORDER_PLACED", message: "Order placed successfully", timestamp: new Date(Date.now() - 10 * 86400000) },
        { status: "PAYMENT_CONFIRMED", message: "Payment confirmed via Trade Wallet", timestamp: new Date(Date.now() - 10 * 86400000) },
        { status: "PROCESSING", message: "Vendor is processing your order", timestamp: new Date(Date.now() - 9 * 86400000) },
        { status: "PACKED", message: "Order packed and ready for pickup", timestamp: new Date(Date.now() - 8 * 86400000) },
        { status: "PICKED_UP", message: "Order picked up by delivery partner", timestamp: new Date(Date.now() - 7 * 86400000) },
        { status: "IN_TRANSIT", message: "Order in transit to your location", timestamp: new Date(Date.now() - 5 * 86400000) },
        { status: "OUT_FOR_DELIVERY", message: "Out for delivery today", timestamp: new Date(Date.now() - 3 * 86400000) },
        { status: "DELIVERED", message: "Order delivered successfully", timestamp: new Date(Date.now() - 3 * 86400000) },
      ],
      estimatedDeliveryDate: new Date(Date.now() - 3 * 86400000),
      orderStatus: "DELIVERED",
      paymentMethod: "TRADE_WALLET",
      paymentStatus: "PAID",
      orderNumber: orderNum(),
      returnWindowEndsAt: new Date(Date.now() + 4 * 86400000),
    },
    // Order 2 — In Transit (buyer1)
    {
      buyerId: buyer1._id,
      items: [
        { productId: approvedProducts[4]._id, vendorId: vendor2._id, quantity: 1, priceAtPurchase: 22999, status: "SHIPPED" },
      ],
      totalAmount: 22999,
      deliveryAddress: deliveryAddr(buyer1, addresses[0]),
      deliveryTracking: [
        { status: "ORDER_PLACED", message: "Order placed successfully", timestamp: new Date(Date.now() - 3 * 86400000) },
        { status: "PAYMENT_CONFIRMED", message: "Payment confirmed", timestamp: new Date(Date.now() - 3 * 86400000) },
        { status: "PROCESSING", message: "Vendor is processing", timestamp: new Date(Date.now() - 2 * 86400000) },
        { status: "PACKED", message: "Packed and ready", timestamp: new Date(Date.now() - 1 * 86400000) },
        { status: "PICKED_UP", message: "Picked up by courier", timestamp: new Date(Date.now() - 12 * 3600000) },
        { status: "IN_TRANSIT", message: "On its way to you", timestamp: new Date(Date.now() - 6 * 3600000) },
      ],
      estimatedDeliveryDate: new Date(Date.now() + 2 * 86400000),
      orderStatus: "SHIPPED",
      paymentMethod: "TRADE_WALLET",
      paymentStatus: "PAID",
      orderNumber: orderNum(),
    },
    // Order 3 — Delivered (buyer2)
    {
      buyerId: buyer2._id,
      items: [
        { productId: approvedProducts[6]._id, vendorId: vendor2._id, quantity: 1, priceAtPurchase: 68999, status: "DELIVERED", deliveredAt: new Date(Date.now() - 5 * 86400000) },
      ],
      totalAmount: 68999,
      deliveryAddress: deliveryAddr(buyer2, addresses[1]),
      deliveryTracking: [
        { status: "ORDER_PLACED", message: "Order placed", timestamp: new Date(Date.now() - 12 * 86400000) },
        { status: "PAYMENT_CONFIRMED", message: "Payment confirmed", timestamp: new Date(Date.now() - 12 * 86400000) },
        { status: "DELIVERED", message: "Delivered", timestamp: new Date(Date.now() - 5 * 86400000) },
      ],
      estimatedDeliveryDate: new Date(Date.now() - 5 * 86400000),
      orderStatus: "DELIVERED",
      discountAmount: 2000,
      couponCode: "WELCOME20",
      paymentMethod: "TRADE_WALLET",
      paymentStatus: "PAID",
      orderNumber: orderNum(),
      returnWindowEndsAt: new Date(Date.now() + 2 * 86400000),
    },
    // Order 4 — Confirmed / Processing (buyer2)
    {
      buyerId: buyer2._id,
      items: [
        { productId: approvedProducts[1]._id, vendorId: vendor1._id, quantity: 1, priceAtPurchase: 4999, status: "PENDING" },
        { productId: approvedProducts[3]._id, vendorId: vendor1._id, quantity: 1, priceAtPurchase: 2199, status: "PENDING" },
      ],
      totalAmount: 7198,
      deliveryAddress: deliveryAddr(buyer2, addresses[1]),
      deliveryTracking: [
        { status: "ORDER_PLACED", message: "Order placed", timestamp: new Date(Date.now() - 1 * 86400000) },
        { status: "PAYMENT_CONFIRMED", message: "Payment confirmed", timestamp: new Date(Date.now() - 1 * 86400000) },
      ],
      estimatedDeliveryDate: new Date(Date.now() + 6 * 86400000),
      orderStatus: "CONFIRMED",
      paymentMethod: "TRADE_WALLET",
      paymentStatus: "PAID",
      orderNumber: orderNum(),
    },
    // Order 5 — Cancelled (buyer3)
    {
      buyerId: buyer3._id,
      items: [
        { productId: approvedProducts[5]._id, vendorId: vendor2._id, quantity: 1, priceAtPurchase: 8499, status: "CANCELLED" },
      ],
      totalAmount: 8499,
      deliveryAddress: deliveryAddr(buyer3, addresses[2]),
      deliveryTracking: [
        { status: "ORDER_PLACED", message: "Order placed", timestamp: new Date(Date.now() - 5 * 86400000) },
        { status: "PAYMENT_CONFIRMED", message: "Payment confirmed", timestamp: new Date(Date.now() - 5 * 86400000) },
      ],
      orderStatus: "CANCELLED",
      paymentMethod: "COD",
      paymentStatus: "REFUNDED",
      orderNumber: orderNum(),
      cancelledAt: new Date(Date.now() - 4 * 86400000),
    },
    // Order 6 — Pending payment (buyer3)
    {
      buyerId: buyer3._id,
      items: [
        { productId: approvedProducts[8]._id, vendorId: vendor2._id, quantity: 2, priceAtPurchase: 3499, status: "PENDING" },
      ],
      totalAmount: 6998,
      deliveryAddress: deliveryAddr(buyer3, addresses[2]),
      deliveryTracking: [
        { status: "ORDER_PLACED", message: "Order placed", timestamp: new Date() },
      ],
      estimatedDeliveryDate: new Date(Date.now() + 3 * 86400000),
      orderStatus: "PENDING_PAYMENT",
      paymentMethod: "TRADE_WALLET",
      paymentStatus: "PENDING",
      orderNumber: orderNum(),
    },
  ]);

  console.log(`   ✓ ${orders.length} orders created in various statuses`);

  // ── Order-linked wallet debits ──────────────────────────────────────
  await WalletTransaction.insertMany([
    { userId: buyer1._id, type: "DEBIT", amount: 2697, description: "Order payment", orderId: orders[0]._id, status: "COMPLETED" },
    { userId: buyer1._id, type: "DEBIT", amount: 22999, description: "Order payment", orderId: orders[1]._id, status: "COMPLETED" },
    { userId: buyer2._id, type: "DEBIT", amount: 68999, description: "Order payment", orderId: orders[2]._id, status: "COMPLETED" },
    { userId: buyer2._id, type: "DEBIT", amount: 7198, description: "Order payment", orderId: orders[3]._id, status: "COMPLETED" },
    { userId: buyer3._id, type: "REFUND", amount: 8499, description: "Order cancelled — refund", orderId: orders[4]._id, status: "COMPLETED" },
  ]);

  // ══════════════════════════════════════════════════════════════════
  // 8. RATINGS
  // ══════════════════════════════════════════════════════════════════
  console.log("⭐  Creating ratings...");

  await Rating.insertMany([
    // Product ratings (from delivered orders)
    { reviewerId: buyer1._id, reviewerName: buyer1.name, targetType: "PRODUCT", productId: approvedProducts[0]._id, vendorId: vendor1._id, orderId: orders[0]._id, stars: 5, review: pick(PRODUCT_REVIEWS) },
    { reviewerId: buyer1._id, reviewerName: buyer1.name, targetType: "PRODUCT", productId: approvedProducts[2]._id, vendorId: vendor1._id, orderId: orders[0]._id, stars: 4, review: pick(PRODUCT_REVIEWS) },
    { reviewerId: buyer2._id, reviewerName: buyer2.name, targetType: "PRODUCT", productId: approvedProducts[6]._id, vendorId: vendor2._id, orderId: orders[2]._id, stars: 5, review: pick(PRODUCT_REVIEWS) },
    { reviewerId: buyer1._id, reviewerName: buyer1.name, targetType: "PRODUCT", productId: approvedProducts[4]._id, vendorId: vendor2._id, orderId: orders[1]._id, stars: 4, review: pick(PRODUCT_REVIEWS) },
    // Vendor ratings
    { reviewerId: buyer1._id, reviewerName: buyer1.name, targetType: "VENDOR", vendorId: vendor1._id, orderId: orders[0]._id, stars: 5, review: "Great vendor, fast packaging!" },
    { reviewerId: buyer2._id, reviewerName: buyer2.name, targetType: "VENDOR", vendorId: vendor2._id, orderId: orders[2]._id, stars: 5, review: "Excellent electronics, authentic products." },
    // Buyer ratings by vendors
    { reviewerId: vendorUser1._id, reviewerName: vendorUser1.name, targetType: "BUYER", buyerId: buyer1._id, orderId: orders[0]._id, stars: 5, review: "Reliable buyer, prompt payment." },
    { reviewerId: vendorUser2._id, reviewerName: vendorUser2.name, targetType: "BUYER", buyerId: buyer2._id, orderId: orders[2]._id, stars: 5, review: "Great buyer, no issues." },
  ]);

  console.log(`   ✓ 8 ratings created`);

  // ══════════════════════════════════════════════════════════════════
  // 9. COUPONS
  // ══════════════════════════════════════════════════════════════════
  console.log("🎟️  Creating coupons...");

  await Coupon.insertMany([
    {
      code: "WELCOME20",
      description: "20% off on your first order",
      discountType: "PERCENT",
      discountValue: 20,
      minOrderValue: 500,
      maxDiscount: 2000,
      usageLimit: 1000,
      usedCount: 1,
      expiresAt: new Date(Date.now() + 90 * 86400000),
      isActive: true,
    },
    {
      code: "FLAT500",
      description: "Flat ₹500 off on orders above ₹3000",
      discountType: "FLAT",
      discountValue: 500,
      minOrderValue: 3000,
      usageLimit: 500,
      usedCount: 0,
      expiresAt: new Date(Date.now() + 60 * 86400000),
      isActive: true,
    },
    {
      code: "ELEC10",
      description: "10% off on electronics",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderValue: 5000,
      maxDiscount: 5000,
      usageLimit: null,
      usedCount: 0,
      expiresAt: new Date(Date.now() + 45 * 86400000),
      isActive: true,
    },
    {
      code: "EXPIRED50",
      description: "Expired test coupon",
      discountType: "FLAT",
      discountValue: 50,
      minOrderValue: 0,
      expiresAt: new Date(Date.now() - 1 * 86400000),
      isActive: false,
    },
  ]);

  console.log(`   ✓ 4 coupons created (3 active, 1 expired)`);

  // ══════════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════════
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║           🎉  TradeSphere Test Data Seeded!              ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log("║  CREDENTIALS (password shown in brackets)               ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log("║  👑 Admin                                                ║");
  console.log("║     admin@tradesphere.com       [Admin@123]              ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log("║  🛍️  Buyers                                               ║");
  console.log("║     buyer1@tradesphere.com      [Buyer@123]              ║");
  console.log("║     buyer2@tradesphere.com      [Buyer@123]              ║");
  console.log("║     buyer3@tradesphere.com      [Buyer@123]              ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log("║  🏪 Vendors                                              ║");
  console.log("║     vendor1@tradesphere.com     [Vendor@123]             ║");
  console.log("║     vendor2@tradesphere.com     [Vendor@123]             ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log("║  🚚 Delivery Employee                                    ║");
  console.log("║     delivery@tradesphere.com    [Delivery@123]           ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log("║  DATA SUMMARY                                            ║");
  console.log("║     Categories  : 8   (3 parent + 5 leaf)               ║");
  console.log("║     Products    : 10  (9 approved, 1 pending)            ║");
  console.log("║     Orders      : 6   (delivered/transit/confirmed/      ║");
  console.log("║                       cancelled/pending)                 ║");
  console.log("║     Coupons     : 4   (WELCOME20, FLAT500, ELEC10)       ║");
  console.log("║     Ratings     : 8                                      ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("\n💡  Re-run with --fresh to wipe and re-seed from scratch\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seeder failed:", err.message);
  console.error(err);
  process.exit(1);
});