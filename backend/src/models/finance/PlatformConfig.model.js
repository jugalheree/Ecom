import mongoose from "mongoose";

/**
 * PlatformConfig — singleton document for platform-wide settings.
 * Only one document exists (enforced by the `singleton` field).
 * Admin can update commission, festival discount, etc. at any time.
 */
const platformConfigSchema = new mongoose.Schema(
  {
    // Singleton guard — always "default"
    singleton: { type: String, default: "default", unique: true },

    // ── Admin Commission ──────────────────────────────────────────────────
    // Platform takes this % from every vendor sale
    commissionPercent: {
      type: Number,
      required: true,
      default: 5,   // 5% default platform fee
      min: 0,
      max: 50,
    },

    // ── Festival Discount ─────────────────────────────────────────────────
    // When active, this % is applied on top of vendor discount on all products
    festivalDiscountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 50,
    },

    festivalDiscountActive: {
      type: Boolean,
      default: false,
    },

    festivalName: {
      type: String,
      default: "",   // e.g. "Diwali Sale", "Independence Day"
    },

    festivalEndsAt: {
      type: Date,
      default: null,
    },

    // ── Last updated by ────────────────────────────────────────────────────
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const PlatformConfig = mongoose.model("PlatformConfig", platformConfigSchema);
