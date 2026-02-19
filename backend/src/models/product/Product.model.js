import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    price: { type: Number, required: true, min: 0 },

    aiScore: { type: Number, default: 0, min: 0, max: 100 },

    category: { type: String, default: "General" },
    subCategory: { type: String, default: "" },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // NOT "Vendor"
    },

    isActive: { type: Boolean, default: true },
    stock: { type: Number, default: 0, min: 0 },

    images: [
      {
        url: String,
        alt: String,
      },
    ],
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
