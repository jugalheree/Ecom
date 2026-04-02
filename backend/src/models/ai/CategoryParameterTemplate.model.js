import mongoose from "mongoose";

/**
 * CategoryParameterTemplate — AI-driven scoring weights per category.
 * Each category can override the default weight distribution used
 * by the AI scoring algorithm to emphasise the most important fields
 * for that product type.
 */
const categoryParameterTemplateSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      unique: true,
    },
    categorySlug: { type: String, required: true, lowercase: true, trim: true },

    // Scoring weights — must sum to ~1.0; used to scale the AI partial scores
    weights: {
      descriptionCompleteness: { type: Number, default: 0.32 },
      titleQuality:            { type: Number, default: 0.20 },
      keywordRichness:         { type: Number, default: 0.20 },
      categoryTerms:           { type: Number, default: 0.16 },
      redFlagPenalty:          { type: Number, default: 0.08 },  // penalty share
      attributeCompleteness:   { type: Number, default: 0.04 },  // bonus for filled attributes
    },

    // Minimum description length expected (chars) for "complete" score
    minDescriptionLength: { type: Number, default: 150 },

    // Extra required keywords for this category (beyond global bank)
    requiredKeywords: [String],

    // Auto-computed from product attributes — e.g. ["size","color","brand"]
    importantAttributes: [String],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categoryParameterTemplateSchema.index({ categoryId: 1 });
categoryParameterTemplateSchema.index({ categorySlug: 1 });

export const CategoryParameterTemplate = mongoose.model(
  "CategoryParameterTemplate",
  categoryParameterTemplateSchema
);