/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║               TradeSphere — Admin Seed Script                   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Run ONCE after first deployment to create the admin account.   ║
 * ║                                                                  ║
 * ║  Usage:                                                          ║
 * ║    node seed.js                                                  ║
 * ║                                                                  ║
 * ║  What it does:                                                   ║
 * ║    1. Connects to MongoDB                                        ║
 * ║    2. Checks if an admin already exists (safe to run again)      ║
 * ║    3. Creates the admin user if none exists                      ║
 * ║    4. Prints the login credentials                               ║
 * ║    5. Exits cleanly                                              ║
 * ║                                                                  ║
 * ║  ⚠  CHANGE THE PASSWORD after first login!                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import mongoose from "mongoose";
import bcrypt from "bcrypt";

// ── Config (change these if you want) ────────────────────────────────────
const ADMIN_NAME     = "TradeSphere Admin";
const ADMIN_EMAIL    = "admin@tradesphere.com";
const ADMIN_PASSWORD = "Admin@123";   // ⚠ Change after first login!
// ─────────────────────────────────────────────────────────────────────────

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("❌  MONGODB_URI is not set in .env");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅  Connected\n");

  // We define the schema inline so this script has zero import complexity
  const userSchema = new mongoose.Schema(
    {
      name:     { type: String, required: true },
      email:    { type: String, unique: true, sparse: true },
      phone:    { type: String, unique: true, sparse: true },
      password: { type: String, required: true },
      role:     { type: String, enum: ["BUYER","VENDOR","EMPLOYEE","ADMIN"], default: "BUYER" },
      isActive: { type: Boolean, default: true },
      isBlocked:{ type: Boolean, default: false },
    },
    { timestamps: true }
  );

  const User = mongoose.models.User || mongoose.model("User", userSchema);

  // Check if an admin already exists
  const existingAdmin = await User.findOne({ role: "ADMIN" });

  if (existingAdmin) {
    console.log("ℹ️   An admin account already exists:");
    console.log(`    Name  : ${existingAdmin.name}`);
    console.log(`    Email : ${existingAdmin.email}`);
    console.log("\n✅  Nothing to do. Exiting.");
    await mongoose.disconnect();
    process.exit(0);
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Create the admin
  const admin = await User.create({
    name:     ADMIN_NAME,
    email:    ADMIN_EMAIL,
    password: hashedPassword,
    role:     "ADMIN",
    isActive: true,
    isBlocked: false,
  });

  console.log("🎉  Admin account created successfully!\n");
  console.log("┌─────────────────────────────────────────┐");
  console.log("│         Admin Login Credentials         │");
  console.log("├─────────────────────────────────────────┤");
  console.log(`│  Email    : ${ADMIN_EMAIL.padEnd(29)}│`);
  console.log(`│  Password : ${ADMIN_PASSWORD.padEnd(29)}│`);
  console.log("├─────────────────────────────────────────┤");
  console.log("│  ⚠  CHANGE THE PASSWORD AFTER LOGIN!    │");
  console.log("└─────────────────────────────────────────┘\n");

  await mongoose.disconnect();
  console.log("🔌  Disconnected from MongoDB");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
