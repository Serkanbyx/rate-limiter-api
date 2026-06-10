const { getRedisClient, isRedisConnected } = require("../config/redis");
const env = require("../config/env");

/**
 * Iterates over all keys matching a pattern using non-blocking SCAN.
 * Preferred over KEYS, which blocks the Redis event loop (O(N)) in production.
 */
const scanKeys = async (client, pattern, count = 100) => {
  const found = [];
  let cursor = "0";

  do {
    const [nextCursor, batch] = await client.scan(cursor, "MATCH", pattern, "COUNT", count);
    cursor = nextCursor;
    found.push(...batch);
  } while (cursor !== "0");

  return found;
};

const getPublicResource = (_req, res) => {
  res.json({
    success: true,
    message: "Welcome to the public endpoint! This route has standard rate limiting.",
    data: {
      timestamp: new Date().toISOString(),
      info: "This endpoint allows 100 requests per 15-minute window.",
    },
  });
};

const getProtectedResource = (_req, res) => {
  res.json({
    success: true,
    message: "You accessed a protected endpoint with strict rate limiting.",
    data: {
      timestamp: new Date().toISOString(),
      info: "This endpoint allows only 10 requests per 1-minute window.",
      secret: env.demoSecret,
    },
  });
};

const simulateLogin = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required.",
    });
  }

  if (username === env.demoUsername && password === env.demoPassword) {
    return res.json({
      success: true,
      message: "Login successful (demo only).",
      data: { token: env.demoToken },
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid credentials.",
  });
};

const getRateLimitStatus = async (req, res) => {
  const baseResponse = {
    ip: req.ip,
    headers: {
      limit: res.getHeader("RateLimit-Limit"),
      remaining: res.getHeader("RateLimit-Remaining"),
      reset: res.getHeader("RateLimit-Reset"),
    },
  };

  if (!isRedisConnected()) {
    return res.json({
      success: true,
      data: {
        ...baseResponse,
        store: "memory",
        message: "Using in-memory store. Redis keys unavailable.",
      },
    });
  }

  try {
    const redisClient = getRedisClient();
    const keys = await scanKeys(redisClient, "rl:*");

    res.json({
      success: true,
      data: {
        ...baseResponse,
        store: "redis",
        activeKeys: keys.length,
      },
    });
  } catch {
    res.json({
      success: true,
      data: {
        ...baseResponse,
        store: "memory",
        message: "Redis query failed. Showing available info only.",
      },
    });
  }
};

const resetRateLimit = async (req, res) => {
  if (!isRedisConnected()) {
    return res.status(400).json({
      success: false,
      message: "Rate limit reset requires Redis. Currently using in-memory store.",
    });
  }

  try {
    const redisClient = getRedisClient();
    const { ip } = req.query;
    const targetIp = ip || req.ip;

    // Keys are stored as "<prefix>:<ip>" (e.g. "rl:global:127.0.0.1").
    // Anchoring the IP at the end avoids accidentally matching similar IPs
    // such as "127.0.0.10" when resetting "127.0.0.1".
    const keys = await scanKeys(redisClient, `rl:*:${targetIp}`);

    if (keys.length > 0) {
      await redisClient.del(...keys);
    }

    res.json({
      success: true,
      message: `Rate limit reset for IP: ${targetIp}`,
      data: { keysRemoved: keys.length },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to reset rate limit.",
    });
  }
};

module.exports = {
  getPublicResource,
  getProtectedResource,
  simulateLogin,
  getRateLimitStatus,
  resetRateLimit,
};
