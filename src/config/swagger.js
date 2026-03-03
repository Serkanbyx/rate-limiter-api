const swaggerJsdoc = require("swagger-jsdoc");
const env = require("./env");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Rate Limiter API",
    version: "1.0.0",
    description:
      "A distributed Rate Limiter API built with Express, Redis, and express-rate-limit. " +
      "Demonstrates API abuse prevention with multiple rate limiting tiers.",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: "Development server",
    },
  ],
  components: {
    schemas: {
      RateLimitInfo: {
        type: "object",
        properties: {
          limit: {
            type: "integer",
            description: "Maximum number of requests allowed in the window",
            example: 100,
          },
          current: {
            type: "integer",
            description: "Number of requests made in the current window",
            example: 5,
          },
          remaining: {
            type: "integer",
            description: "Number of requests remaining in the current window",
            example: 95,
          },
          resetTime: {
            type: "string",
            format: "date-time",
            description: "Time when the rate limit window resets",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Too many requests, please try again later.",
          },
          retryAfter: {
            type: "integer",
            description: "Seconds until the rate limit resets",
            example: 900,
          },
        },
      },
      HealthResponse: {
        type: "object",
        properties: {
          status: {
            type: "string",
            example: "healthy",
          },
          uptime: {
            type: "number",
            example: 1234.56,
          },
          timestamp: {
            type: "string",
            format: "date-time",
          },
          redis: {
            type: "string",
            enum: ["connected", "disconnected"],
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
