/**
 * aiScoring.js — Pure-math AI product quality scoring (NO API KEY)
 *
 * Total product score = 5.0
 *   → 2.5  from this file  (product description quality AI score)
 *   → 2.5  from scoreComputation.controller.js (reviews + returns)
 *
 * Algorithm:
 *   1. Description completeness  (0–0.8)
 *   2. Title quality             (0–0.5)
 *   3. Keyword richness & depth  (0–0.5)
 *   4. Category-specific terms   (0–0.4)
 *   5. Red-flag penalty          (0 or –0.2)
 *   → Normalize to 0–2.5
 */

// ─── Category keyword banks ────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  clothing: ["fabric", "cotton", "polyester", "gsm", "thread", "size", "wash", "color", "fit", "material", "stitching", "blend"],
  electronics: ["warranty", "watt", "voltage", "battery", "bluetooth", "wifi", "processor", "ram", "storage", "display", "resolution"],
  food: ["ingredients", "calories", "protein", "expiry", "allergen", "organic", "preservative", "shelf", "nutrition", "grams"],
  pharma: ["dosage", "composition", "manufacturer", "expiry", "prescription", "side effects", "mg", "ml", "batch"],
  furniture: ["material", "dimensions", "weight", "assembly", "wood", "metal", "finish", "warranty", "capacity"],
  general: ["quality", "durable", "material", "size", "color", "use", "feature", "benefit", "specification"],
};

// ─── Red flag patterns ────────────────────────────────────────────────────
const RED_FLAGS = [
  /best in (the )?world/i,
  /100% (genuine|authentic|original)/i,
  /guaranteed results/i,
  /no side effects/i,
  /miracle/i,
  /instant cure/i,
];

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Count how many words in `text` match words in `bank` */
function countKeywordMatches(text, bank) {
  const lower = text.toLowerCase();
  return bank.filter((kw) => lower.includes(kw)).length;
}

/** Measure lexical variety: unique words / total words (capped at 0-1) */
function lexicalDiversity(text) {
  const words = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
  if (words.length === 0) return 0;
  const unique = new Set(words).size;
  return Math.min(1, unique / words.length + 0.2); // slight base boost
}

/** Score description completeness (0-0.8) */
function scoreDescriptionCompleteness(description = "") {
  const len = description.trim().length;
  if (len === 0) return 0;
  if (len < 30) return 0.1;
  if (len < 80) return 0.25;
  if (len < 150) return 0.4;
  if (len < 300) return 0.55;
  if (len < 500) return 0.68;
  return 0.8; // 500+ chars is thorough
}

/** Score title quality (0-0.5) */
function scoreTitleQuality(title = "") {
  const len = title.trim().length;
  const words = title.trim().split(/\s+/).length;
  if (len === 0) return 0;
  if (words < 2) return 0.1;
  if (words < 4) return 0.25;
  if (words < 7) return 0.4;
  return 0.5; // 7+ words gives full title score
}

/** Score keyword richness (0-0.5) based on lexical diversity & sentence count */
function scoreKeywordRichness(description = "") {
  if (!description.trim()) return 0;
  const diversity = lexicalDiversity(description);
  const sentences = (description.match(/[.!?]+/g) || []).length;
  const sentenceScore = Math.min(1, sentences / 4); // 4+ sentences = max
  return Math.round(((diversity * 0.3 + sentenceScore * 0.2)) * 100) / 100;
}

/** Score category-specific term usage (0-0.4) */
function scoreCategoryTerms(title = "", description = "", productCategory = "GENERAL") {
  const bank =
    CATEGORY_KEYWORDS[productCategory.toLowerCase()] ||
    CATEGORY_KEYWORDS.general;
  const text = `${title} ${description}`.toLowerCase();
  const matches = countKeywordMatches(text, bank);
  // 3+ matches = full score
  return Math.min(0.4, (matches / 3) * 0.4);
}

/** Red flag penalty (-0.2 if any red flag found) */
function redFlagPenalty(title = "", description = "") {
  const text = `${title} ${description}`;
  for (const pattern of RED_FLAGS) {
    if (pattern.test(text)) return -0.2;
  }
  return 0;
}

// ─── Main export ─────────────────────────────────────────────────────────

/**
 * computeProductAIScore
 * Returns a number in [0, 2.5] — the AI half of the product rating.
 * Called when a product is created or updated.
 *
 * @param {object} product  - must have: title, description, productCategory
 * @returns {number}        - AI score 0–2.5
 */
export function computeProductAIScore({ title = "", description = "", productCategory = "GENERAL" }) {
  const descScore   = scoreDescriptionCompleteness(description);
  const titleScore  = scoreTitleQuality(title);
  const richScore   = scoreKeywordRichness(description);
  const catScore    = scoreCategoryTerms(title, description, productCategory);
  const penalty     = redFlagPenalty(title, description);

  const raw = descScore + titleScore + richScore + catScore + penalty;

  // Normalize from max possible (0.8+0.5+0.5+0.4 = 2.2) to 0-2.5
  const normalized = (raw / 2.2) * 2.5;
  const final = Math.round(Math.max(0, Math.min(2.5, normalized)) * 100) / 100;

  return final;
}

/**
 * computeProductAIScoreDetailed
 * Returns full breakdown for admin/vendor display.
 */
export function computeProductAIScoreDetailed({ title = "", description = "", productCategory = "GENERAL" }) {
  const descScore  = scoreDescriptionCompleteness(description);
  const titleScore = scoreTitleQuality(title);
  const richScore  = scoreKeywordRichness(description);
  const catScore   = scoreCategoryTerms(title, description, productCategory);
  const penalty    = redFlagPenalty(title, description);

  const raw        = descScore + titleScore + richScore + catScore + penalty;
  const normalized = Math.round(Math.max(0, Math.min(2.5, (raw / 2.2) * 2.5)) * 100) / 100;

  // Feedback messages
  const tips = [];
  if (descScore < 0.4) tips.push("Add a longer, more detailed description (aim for 150+ characters)");
  if (titleScore < 0.4) tips.push("Use a more descriptive title with 4–7 words");
  if (richScore < 0.2)  tips.push("Include more varied keywords and at least 3–4 sentences");
  if (catScore  < 0.2)  tips.push(`Add category-specific terms (e.g. ${(CATEGORY_KEYWORDS[productCategory.toLowerCase()] || CATEGORY_KEYWORDS.general).slice(0,3).join(", ")})`);
  if (penalty < 0)      tips.push("Avoid exaggerated claims like \"best in world\" or \"100% guaranteed\"");

  return {
    aiScore: normalized,
    breakdown: {
      descriptionCompleteness: Math.round(descScore * 100) / 100,
      titleQuality:            Math.round(titleScore * 100) / 100,
      keywordRichness:         Math.round(richScore * 100) / 100,
      categoryTerms:           Math.round(catScore * 100) / 100,
      redFlagPenalty:          Math.round(penalty * 100) / 100,
    },
    tips,
  };
}

/**
 * getTotalProductScore
 * Combines AI score (2.5) + ratingScore (2.5) = total /5
 */
export function getTotalProductScore(aiScore = 0, ratingScore = 0) {
  return Math.round(Math.min(5, aiScore + ratingScore) * 100) / 100;
}
