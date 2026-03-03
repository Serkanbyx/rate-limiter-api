const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middlewares/errorHandler");
const healthRoutes = require("./routes/healthRoutes");
const createApiRoutes = require("./routes/apiRoutes");
const { version } = require("../package.json");

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

  // Root welcome page
  app.get("/", (_req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rate Limiter API</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Courier New", Courier, monospace;
      background: #0a0e1a;
      color: #e0e6f0;
      overflow: hidden;
      position: relative;
    }

    body::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 600px 400px at 20% 30%, rgba(0, 200, 255, 0.06) 0%, transparent 70%),
        radial-gradient(ellipse 500px 350px at 80% 70%, rgba(120, 80, 255, 0.05) 0%, transparent 70%),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 49px,
          rgba(0, 200, 255, 0.03) 49px,
          rgba(0, 200, 255, 0.03) 50px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 49px,
          rgba(0, 200, 255, 0.03) 49px,
          rgba(0, 200, 255, 0.03) 50px
        );
      pointer-events: none;
      z-index: 0;
    }

    .container {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 3rem 2rem;
      max-width: 520px;
      width: 90%;
    }

    .shield {
      width: 80px;
      height: 96px;
      margin: 0 auto 1.8rem;
      position: relative;
    }

    .shield::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(160deg, #00c8ff 0%, #7850ff 100%);
      clip-path: polygon(50% 0%, 100% 20%, 100% 65%, 50% 100%, 0% 65%, 0% 20%);
      opacity: 0.15;
    }

    .shield::after {
      content: "";
      position: absolute;
      inset: 3px;
      background: transparent;
      border: 2px solid #00c8ff;
      clip-path: polygon(50% 0%, 100% 20%, 100% 65%, 50% 100%, 0% 65%, 0% 20%);
      animation: shieldPulse 3s ease-in-out infinite;
    }

    @keyframes shieldPulse {
      0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 4px rgba(0, 200, 255, 0.3)); }
      50% { opacity: 1; filter: drop-shadow(0 0 12px rgba(0, 200, 255, 0.6)); }
    }

    h1 {
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      background: linear-gradient(135deg, #00c8ff 0%, #7850ff 50%, #00c8ff 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradientShift 4s linear infinite;
      margin-bottom: 0.5rem;
    }

    @keyframes gradientShift {
      0% { background-position: 0% center; }
      100% { background-position: 200% center; }
    }

    .version {
      font-size: 0.85rem;
      color: #00c8ff;
      opacity: 0.7;
      letter-spacing: 2px;
      margin-bottom: 2.5rem;
    }

    .links {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      margin-bottom: 2.5rem;
    }

    .links a {
      display: inline-block;
      padding: 0.85rem 1.6rem;
      text-decoration: none;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, rgba(0, 200, 255, 0.12), rgba(120, 80, 255, 0.12));
      color: #00c8ff;
      border: 1px solid rgba(0, 200, 255, 0.4);
      box-shadow: 0 0 15px rgba(0, 200, 255, 0.08), inset 0 0 15px rgba(0, 200, 255, 0.03);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, rgba(0, 200, 255, 0.22), rgba(120, 80, 255, 0.22));
      border-color: #00c8ff;
      box-shadow: 0 0 25px rgba(0, 200, 255, 0.2), inset 0 0 20px rgba(0, 200, 255, 0.06);
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: transparent;
      color: #7850ff;
      border: 1px solid rgba(120, 80, 255, 0.3);
    }

    .btn-secondary:hover {
      border-color: #7850ff;
      box-shadow: 0 0 20px rgba(120, 80, 255, 0.15);
      transform: translateY(-2px);
    }

    .sign {
      font-size: 0.78rem;
      color: rgba(224, 230, 240, 0.35);
      letter-spacing: 0.5px;
    }

    .sign a {
      color: rgba(0, 200, 255, 0.5);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .sign a:hover {
      color: #00c8ff;
    }

    @media (max-width: 480px) {
      h1 { font-size: 1.4rem; letter-spacing: 2px; }
      .container { padding: 2rem 1.2rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="shield"></div>
    <h1>Rate Limiter API</h1>
    <p class="version">v${version}</p>
    <div class="links">
      <a href="/api-docs" class="btn-primary">API Documentation</a>
      <a href="/api/health" class="btn-secondary">Health Check</a>
    </div>
    <footer class="sign">
      Created by
      <a href="https://serkanbayraktar.com/" target="_blank" rel="noopener noreferrer">Serkanby</a>
      |
      <a href="https://github.com/Serkanbyx" target="_blank" rel="noopener noreferrer">Github</a>
    </footer>
  </div>
</body>
</html>`);
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
