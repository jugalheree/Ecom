/**
 * sanitize.middleware.js
 *
 * Recursively strips leading/trailing whitespace from all string fields
 * in req.body, and removes any HTML tags to prevent stored XSS.
 *
 * Applied globally in app.js after body parsers.
 * Does NOT modify numbers, booleans, arrays of non-strings, etc.
 */

const stripHtml = (str) => str.replace(/<[^>]*>/g, "").trim();

const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return stripHtml(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === "object") {
    return sanitizeObject(value);
  }
  return value;
};

const sanitizeObject = (obj) => {
  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = sanitizeValue(obj[key]);
  }
  return result;
};

export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
};
