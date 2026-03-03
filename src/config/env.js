require("dotenv").config();

const env = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,

  // Demo endpoint credentials (not real auth — for demonstration purposes only)
  demoUsername: process.env.DEMO_USERNAME || "admin",
  demoPassword: process.env.DEMO_PASSWORD || "password123",
  demoToken: process.env.DEMO_TOKEN || "demo-jwt-token-abc123",
  demoSecret: process.env.DEMO_SECRET || "rate-limiter-demo-secret-data",
};

module.exports = env;
