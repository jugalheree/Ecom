import mongoose from "mongoose";

const productAttributeValueSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    attributeCode: {
      type: String,
      required: true,
      lowercase: true,
    },

    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    valueType: {
      type: String,
      enum: ["string", "number", "boolean", "enum"],
      required: true,
    },

    numericValue: {
      type: Number,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate attribute per product
productAttributeValueSchema.index(
  { productId: 1, attributeCode: 1 },
  { unique: true }
);

export const ProductAttributeValue = mongoose.model( "ProductAttributeValue", productAttributeValueSchema);