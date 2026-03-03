const { Router } = require("express");
const {
  getPublicResource,
  getProtectedResource,
  simulateLogin,
  getRateLimitStatus,
  resetRateLimit,
} = require("../controllers/apiController");

/**
 * @swagger
 * /api/public:
 *   get:
 *     summary: Public resource (standard rate limit)
 *     description: >
 *       A publicly accessible endpoint protected by the global rate limiter.
 *       Allows 100 requests per 15-minute window.
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     info:
 *                       type: string
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Protected resource (strict rate limit)
 *     description: >
 *       A sensitive endpoint with strict rate limiting.
 *       Allows only 10 requests per 1-minute window.
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: Successful response with secret data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     info:
 *                       type: string
 *                     secret:
 *                       type: string
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login endpoint (auth rate limit)
 *     description: >
 *       Simulates a login endpoint with aggressive rate limiting to prevent brute-force attacks.
 *       Allows only 5 requests per 15-minute window.
 *       Demo credentials are configured via DEMO_USERNAME and DEMO_PASSWORD environment variables.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/rate-limit/status:
 *   get:
 *     summary: Check rate limit status
 *     description: Returns current rate limit information for the requesting IP address.
 *     tags: [Rate Limit Management]
 *     responses:
 *       200:
 *         description: Rate limit status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RateLimitInfo'
 */

/**
 * @swagger
 * /api/rate-limit/reset:
 *   delete:
 *     summary: Reset rate limit for an IP
 *     description: >
 *       Resets the rate limit counter for a specific IP address.
 *       If no IP is provided, resets for the requesting IP.
 *     tags: [Rate Limit Management]
 *     parameters:
 *       - in: query
 *         name: ip
 *         schema:
 *           type: string
 *         description: IP address to reset (defaults to requesting IP)
 *         example: "127.0.0.1"
 *     responses:
 *       200:
 *         description: Rate limit successfully reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     keysRemoved:
 *                       type: integer
 *       500:
 *         description: Failed to reset — Redis unavailable
 */

const createApiRoutes = ({ strictLimiter, authLimiter }) => {
  const router = Router();

  router.get("/public", getPublicResource);
  router.get("/protected", strictLimiter, getProtectedResource);
  router.post("/auth/login", authLimiter, simulateLogin);
  router.get("/rate-limit/status", getRateLimitStatus);
  router.delete("/rate-limit/reset", resetRateLimit);

  return router;
};

module.exports = createApiRoutes;
