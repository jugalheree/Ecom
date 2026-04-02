import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

// ── Validate required environment variables BEFORE anything else ──────────
// If any of these are missing, the app crashes immediately with a clear message
// instead of a cryptic error 10 requests later.
const REQUIRED_ENV = [
  "MONGODB_URI",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error("❌ Missing required environment variables:");
  missing.forEach((key) => console.error(`   - ${key}`));
  console.error("\n📋 Copy .env.example to .env and fill in the values.");
  process.exit(1); // Hard stop — don't start the server without these
}

import connectDB from "./db/index.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });

    app.on("error", (error) => {
      console.error("❌ Express error:", error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  });

// ── Graceful shutdown ─────────────────────────────────────────────────────
// When the server is stopped (Ctrl+C or deployment restart), close cleanly
process.on("SIGTERM", () => {
  console.log("🔄 SIGTERM received — shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🔄 SIGINT received — shutting down gracefully...");
  process.exit(0);
});

// Catch unhandled promise rejections (prevent silent crashes)
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
  // In production, exit and let process manager (PM2/Railway) restart
  if (process.env.NODE_ENV === "production") process.exit(1);
});
