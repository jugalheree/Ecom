import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

// ── Security Headers (helmet) ─────────────────────────────────────────────
// Sets 15+ HTTP headers to protect against common attacks
// (XSS, clickjacking, MIME sniffing, etc.)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // FIX: CSP re-enabled with sensible defaults.
    // In development it's permissive; tighten these in production to match your CDNs/domains.
    contentSecurityPolicy: process.env.NODE_ENV === "production"
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
          },
        }
      : false, // CSP off in development for easier debugging
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin '${origin}' not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body Parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ── Input Sanitization ────────────────────────────────────────────────────
// Strips HTML tags and trims whitespace from all string fields in req.body
// Prevents stored XSS from reaching the database
import { sanitizeBody } from "./middlewares/sanitize.middleware.js";
app.use(sanitizeBody);

// ── Rate Limiters ─────────────────────────────────────────────────────────

// Strict limiter for auth endpoints — prevents brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  // FIX: Only skip in development — never skip in staging or production
  skip: (req) => process.env.NODE_ENV === "development",
});

// General API limiter — prevents abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
  skip: (req) => process.env.NODE_ENV === "development",
});

// Upload limiter — file uploads are expensive
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour per IP
  message: {
    success: false,
    message: "Upload limit reached. Try again in an hour.",
  },
  skip: (req) => process.env.NODE_ENV === "development",
});

// Apply general limiter to all API routes
app.use("/api", apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────
import authRoutes from "./routes/auth.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import marketPlaceRoutes from "./routes/marketplace.routes.js";
import vendorMarketplaceRoutes from "./routes/vendorMarketplace.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import disputeRoutes from "./routes/dispute.routes.js";
import deliveryAssignmentRoutes from "./routes/deliveryAssignment.routes.js";
import dealRoutes from "./routes/deal.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import locationRoutes from "./routes/location.routes.js";
import referralRoutes from "./routes/referral.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import platformConfigRoutes from "./routes/platformConfig.routes.js";
import scoresRoutes from "./routes/scores.routes.js";

// Auth routes get the strict rate limiter
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/marketplace", marketPlaceRoutes);
app.use("/api/vendor-marketplace", vendorMarketplaceRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/assignments", deliveryAssignmentRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/platform", platformConfigRoutes);
app.use("/api/scores", scoresRoutes);

// ── Health Check ──────────────────────────────────────────────────────────
// Required by hosting platforms (Railway, Render, etc.) to know the server is alive
const healthHandler = (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler); // FIX: Also expose under /api/ for consistency

// ── 404 Handler ───────────────────────────────────────────────────────────
app.use("*", (req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────
import { ApiError } from "./utils/ApiError.js";
import logger from "./utils/logger.js";

app.use((err, req, res, next) => {
  // Known operational errors (ApiError) — return clean JSON
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  // CORS error
  if (err.message?.startsWith("CORS:")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  // Unknown errors — log server-side only
  logger.error("[Server Error]", err);

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again."
        : err.message,
  });
});

export { app };
