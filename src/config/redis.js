const Redis = require("ioredis");
const env = require("./env");

let redisClient = null;
let redisConnected = false;

/**
 * Attempts to connect to Redis with a timeout.
 * Returns true if connected, false otherwise.
 */
const connectRedis = async (timeoutMs = 3000) => {
  return new Promise((resolve) => {
    try {
      redisClient = new Redis(env.redisUrl, {
        maxRetriesPerRequest: 20,
        retryStrategy(times) {
          if (times > 5) return null;
          return Math.min(times * 200, 2000);
        },
        enableOfflineQueue: false,
        connectTimeout: timeoutMs,
        lazyConnect: true,
      });

      const timeout = setTimeout(() => {
        console.warn("[Redis] Connection timed out");
        redisConnected = false;
        resolve(false);
      }, timeoutMs);

      redisClient.on("error", () => {});

      redisClient
        .connect()
        .then(() => {
          clearTimeout(timeout);
          redisConnected = true;
          console.log("[Redis] Connected successfully");
          resolve(true);
        })
        .catch((err) => {
          clearTimeout(timeout);
          redisConnected = false;
          console.warn("[Redis] Connection failed:", err.message);
          resolve(false);
        });
    } catch (err) {
      redisConnected = false;
      console.warn("[Redis] Setup error:", err.message);
      resolve(false);
    }
  });
};

const getRedisClient = () => redisClient;

const isRedisConnected = () => redisConnected;

const closeRedisConnection = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      redisClient.disconnect();
    }
    redisClient = null;
    redisConnected = false;
    console.log("[Redis] Connection closed");
  }
};

module.exports = { connectRedis, getRedisClient, isRedisConnected, closeRedisConnection };
