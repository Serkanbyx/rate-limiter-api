const env = require("./config/env");
const { connectRedis, closeRedisConnection } = require("./config/redis");
const { initRateLimiters } = require("./middlewares/rateLimiter");
const createApp = require("./app");

const startServer = async () => {
  const connected = await connectRedis();

  if (!connected) {
    console.warn("[Server] Redis unavailable — using in-memory rate limiting");
  }

  const limiters = initRateLimiters();
  const app = createApp(limiters);

  const server = app.listen(env.port, () => {
    console.log(`\n[Server] Running on http://localhost:${env.port}`);
    console.log(`[Server] Swagger docs at http://localhost:${env.port}/api-docs`);
    console.log(`[Server] Environment: ${env.nodeEnv}\n`);
  });

  const gracefulShutdown = async (signal) => {
    console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
    await closeRedisConnection();
    server.close(() => {
      console.log("[Server] Closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

startServer();
