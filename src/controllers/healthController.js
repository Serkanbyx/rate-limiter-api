const { getRedisClient, isRedisConnected } = require("../config/redis");

const getHealth = async (_req, res) => {
  let redisStatus = "disconnected";

  try {
    if (isRedisConnected()) {
      const client = getRedisClient();
      const pong = await client.ping();
      if (pong === "PONG") redisStatus = "connected";
    }
  } catch {
    redisStatus = "disconnected";
  }

  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    redis: redisStatus,
  });
};

module.exports = { getHealth };
