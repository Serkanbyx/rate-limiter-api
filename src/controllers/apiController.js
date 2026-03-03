const { getRedisClient, isRedisConnected } = require("../config/redis");

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
      secret: "rate-limiter-demo-secret-data",
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

  if (username === "admin" && password === "password123") {
    return res.json({
      success: true,
      message: "Login successful (demo only).",
      data: { token: "demo-jwt-token-abc123" },
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
    const keys = await redisClient.keys("rl:*");

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

    const keys = await redisClient.keys(`rl:*${targetIp}*`);

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
