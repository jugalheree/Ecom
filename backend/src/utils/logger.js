/**
 * logger.js — Lightweight structured logger
 *
 * In production: outputs JSON lines (works with Datadog, Logtail, Railway logs, etc.)
 * In development: outputs readable colored text to console
 *
 * Usage:
 *   import logger from "../utils/logger.js";
 *   logger.info("Order placed", { orderId, userId });
 *   logger.warn("Low stock", { productId, qty });
 *   logger.error("Payment failed", error);
 */

const isProd = process.env.NODE_ENV === "production";

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const MIN_LEVEL = isProd ? LEVELS.info : LEVELS.debug;

const DEV_COLORS = {
  error: "\x1b[31m", // red
  warn:  "\x1b[33m", // yellow
  info:  "\x1b[36m", // cyan
  debug: "\x1b[90m", // grey
  reset: "\x1b[0m",
};

function formatDev(level, message, meta) {
  const c = DEV_COLORS[level];
  const r = DEV_COLORS.reset;
  const ts = new Date().toISOString().slice(11, 23); // HH:mm:ss.mmm
  let out = `${c}[${ts}] ${level.toUpperCase().padEnd(5)}${r}  ${message}`;
  if (meta instanceof Error) {
    out += `\n${c}${meta.stack || meta.message}${r}`;
  } else if (meta && typeof meta === "object" && Object.keys(meta).length) {
    out += `\n${JSON.stringify(meta, null, 2)}`;
  }
  return out;
}

function formatProd(level, message, meta) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
  };
  if (meta instanceof Error) {
    entry.error = { message: meta.message, stack: meta.stack, name: meta.name };
  } else if (meta) {
    entry.meta = meta;
  }
  return JSON.stringify(entry);
}

function log(level, message, meta) {
  if (LEVELS[level] > MIN_LEVEL) return;
  const line = isProd
    ? formatProd(level, message, meta)
    : formatDev(level, message, meta);

  if (level === "error" || level === "warn") {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

const logger = {
  error: (msg, meta) => log("error", msg, meta),
  warn:  (msg, meta) => log("warn",  msg, meta),
  info:  (msg, meta) => log("info",  msg, meta),
  debug: (msg, meta) => log("debug", msg, meta),
};

export default logger;
