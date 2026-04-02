import mongoose from "mongoose";

const productAIScoreSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    aiScore:               { type: Number, default: 0, min: 0, max: 2.5 },
    ratingScore:           { type: Number, default: 0, min: 0, max: 2.5 },
    totalScore:            { type: Number, default: 0, min: 0, max: 5 },
    breakdown: {
      descriptionCompleteness: { type: Number, default: 0 },
      titleQuality:            { type: Number, default: 0 },
      keywordRichness:         { type: Number, default: 0 },
      categoryTerms:           { type: Number, default: 0 },
      redFlagPenalty:          { type: Number, default: 0 },
    },
    tips:        [String],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

productAIScoreSchema.index({ productId: 1 });

export const ProductAIScore = mongoose.model("ProductAIScore", productAIScoreSchema);