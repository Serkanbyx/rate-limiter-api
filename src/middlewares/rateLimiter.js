const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { getRedisClient, isRedisConnected } = require("../config/redis");
const env = require("../config/env");

/**
 * Creates a Redis-backed store if Redis is connected, otherwise returns undefined
 * (express-rate-limit will use its default in-memory store).
 */
const createStore = (prefix) => {
  if (!isRedisConnected()) return undefined;

  try {
    const client = getRedisClient();
    return new RedisStore({
      sendCommand: (...args) => client.call(...args),
      prefix,
    });
  } catch (err) {
    console.warn(`[RateLimiter] Failed to create Redis store (${prefix}):`, err.message);
    return undefined;
  }
};

const createRateLimiter = ({
  windowMs = env.rateLimitWindowMs,
  max = env.rateLimitMaxRequests,
  message = "Too many requests, please try again later.",
  prefix = "rl:",
} = {}) => {
  const store = createStore(prefix);
  const storeType = store ? "Redis" : "Memory";
  console.log(`[RateLimiter] ${prefix} -> ${storeType} store (${max} req / ${windowMs / 1000}s)`);

  return rateLimit({
    windowMs,
    max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    store,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
  });
};

/**
 * Initializes all rate limiters. Must be called AFTER Redis connection attempt.
 */
const initRateLimiters = () => {
  const globalLimiter = createRateLimiter({
    prefix: "rl:global:",
  });

  const strictLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    message: "Rate limit exceeded for this endpoint. Please wait before retrying.",
    prefix: "rl:strict:",
  });

  const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many authentication attempts. Please try again later.",
    prefix: "rl:auth:",
  });

  return { globalLimiter, strictLimiter, authLimiter };
};

module.exports = { createRateLimiter, initRateLimiters };
