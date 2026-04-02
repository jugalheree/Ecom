import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

// ── Validate required environment variables BEFORE anything else ──────────
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
  process.exit(1);
}

import connectDB from "./db/index.js";
import { app } from "./app.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV || "development" });
    });

    app.on("error", (error) => {
      logger.error("Express server error", error);
      process.exit(1);
    });
  })
  .catch((error) => {
    logger.error("MongoDB connection failed", error);
    process.exit(1);
  });

// ── Graceful shutdown ─────────────────────────────────────────────────────
process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received — shutting down gracefully");
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", reason instanceof Error ? reason : new Error(String(reason)));
  if (process.env.NODE_ENV === "production") process.exit(1);
});
