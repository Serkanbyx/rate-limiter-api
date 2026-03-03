const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middlewares/errorHandler");
const healthRoutes = require("./routes/healthRoutes");
const createApiRoutes = require("./routes/apiRoutes");

const createApp = ({ globalLimiter, strictLimiter, authLimiter }) => {
  const app = express();

  // Security & parsing
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Global rate limiter applied to all routes
  app.use(globalLimiter);

  // Swagger documentation UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Rate Limiter API Docs",
  }));

  // Swagger JSON spec endpoint
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Routes
  app.use("/api/health", healthRoutes);
  app.use("/api", createApiRoutes({ strictLimiter, authLimiter }));

  // Root redirect to docs
  app.get("/", (_req, res) => {
    res.redirect("/api-docs");
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found. Visit /api-docs for available endpoints.",
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
