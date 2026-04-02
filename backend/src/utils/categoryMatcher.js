/**
 * categoryMatcher.js — Auto-category detection + spell suggestion (NO API KEY)
 *
 * Features:
 *   1. suggestCategory(text)   — given vendor's typed text, returns best matching
 *                                category from DB (fuzzy match)
 *   2. spellCorrect(word, list) — Levenshtein-based spell correction
 *   3. autoDetectCategory(title, description) — classify product without DB lookup
 */

import { Category } from "../models/product/Category.model.js";

// ─── Levenshtein distance (edit distance) ────────────────────────────────
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

/**
 * Fuzzy similarity score between 0 and 1
 * 1 = identical, 0 = totally different
 */
function similarity(a, b) {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / maxLen;
}

/**
 * spellCorrect
 * Given a typed word and a list of valid options,
 * returns the best match if similarity > threshold, else null.
 *
 * @param {string}   typed     — what the vendor typed
 * @param {string[]} options   — list of valid category names
 * @param {number}   threshold — min similarity to suggest (default 0.5)
 * @returns {{ suggestion: string, score: number } | null}
 */
export function spellCorrect(typed, options, threshold = 0.5) {
  if (!typed || !options.length) return null;

  let best = null;
  let bestScore = 0;

  for (const opt of options) {
    // Also check if typed is a substring of option or vice versa
    const tLow = typed.toLowerCase();
    const oLow = opt.toLowerCase();
    const substringBonus = oLow.includes(tLow) || tLow.includes(oLow) ? 0.3 : 0;
    const sim = similarity(typed, opt) + substringBonus;

    if (sim > bestScore) {
      bestScore = sim;
      best = { suggestion: opt, score: Math.min(1, sim) };
    }
  }

  if (best && best.score >= threshold) return best;
  return null;
}

/**
 * suggestCategoryFromDB
 * Fetches all active categories and finds the best match for typed text.
 *
 * @param {string} typed  — the vendor typed text
 * @returns {Promise<{ category: object, confidence: number, correction: string|null }>}
 */
export async function suggestCategoryFromDB(typed) {
  if (!typed || typed.trim().length < 2) return null;

  const categories = await Category.find({ isActive: true }).lean();
  if (!categories.length) return null;

  const names = categories.map((c) => c.name);
  const match = spellCorrect(typed, names, 0.4);

  if (!match) return null;

  const matchedCategory = categories.find(
    (c) => c.name.toLowerCase() === match.suggestion.toLowerCase()
  );

  // Was there a spelling correction?
  const needsCorrection =
    typed.toLowerCase().trim() !== match.suggestion.toLowerCase().trim();

  return {
    category: matchedCategory,
    confidence: Math.round(match.score * 100),
    correction: needsCorrection ? match.suggestion : null,
  };
}

// ─── Static keyword → category hints ────────────────────────────────────
const CATEGORY_HINTS = [
  { keywords: ["shirt", "pant", "jean", "kurta", "dress", "saree", "blouse", "dupatta", "salwar", "trouser", "jacket", "coat", "hoodie", "tshirt", "t-shirt"], hint: "Clothing" },
  { keywords: ["phone", "mobile", "laptop", "tablet", "computer", "cpu", "gpu", "headphone", "earphone", "speaker", "charger", "cable", "monitor", "keyboard", "mouse"], hint: "Electronics" },
  { keywords: ["rice", "wheat", "dal", "flour", "oil", "spice", "masala", "salt", "sugar", "tea", "coffee", "biscuit", "snack", "chocolate", "juice", "milk", "ghee"], hint: "Food" },
  { keywords: ["tablet", "capsule", "syrup", "medicine", "cream", "ointment", "supplement", "vitamin", "protein", "health"], hint: "Pharma / Health" },
  { keywords: ["sofa", "chair", "table", "bed", "wardrobe", "shelf", "cabinet", "desk", "almirah", "mattress", "pillow", "curtain"], hint: "Furniture" },
  { keywords: ["book", "notebook", "pen", "pencil", "stationery", "bag", "backpack", "file", "folder"], hint: "Stationery" },
  { keywords: ["toy", "game", "puzzle", "doll", "lego", "cricket", "football", "bat", "ball", "cycle", "bicycle"], hint: "Toys & Sports" },
  { keywords: ["soap", "shampoo", "facewash", "moisturizer", "perfume", "deodorant", "toothpaste", "lotion", "skincare"], hint: "Beauty & Personal Care" },
];

/**
 * autoDetectCategoryHint
 * Returns a category hint string based on product title/description keywords.
 * Pure math, no DB needed.
 *
 * @param {string} title
 * @param {string} description
 * @returns {string|null} — e.g. "Electronics", "Clothing", null
 */
export function autoDetectCategoryHint(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  let bestHint = null;
  let bestCount = 0;

  for (const { keywords, hint } of CATEGORY_HINTS) {
    const count = keywords.filter((kw) => text.includes(kw)).length;
    if (count > bestCount) {
      bestCount = count;
      bestHint = hint;
    }
  }

  return bestCount > 0 ? bestHint : null;
}
