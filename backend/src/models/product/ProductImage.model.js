import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const ProductImage = mongoose.model(
  "ProductImage",
  productImageSchema
);
