import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';

const app = express();

// CORS: with credentials: true, browser requires a specific origin (not *)
const defaultOrigins = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"];
const corsOrigin = process.env.CORS_ORIGIN;
const origins = corsOrigin
  ? (corsOrigin.includes(",") ? corsOrigin.split(",").map((o) => o.trim()) : [corsOrigin])
  : defaultOrigins;
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origins.includes(origin)) return cb(null, true);
    if (origins[0] === "*") return cb(null, true);
    cb(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public'));
app.use(cookieParser());

// Health check for frontend/load balancer (no auth)
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Backend is running" });
});

import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from "./routes/order.routes.js";

app.use("/api/orders", orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/products', productRoutes);

import { ApiError } from "./utils/ApiError.js";

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});



export { app }