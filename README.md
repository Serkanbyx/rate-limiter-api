# ⚡ Rate Limiter API

A distributed Rate Limiter API built with **Express**, **Redis**, and **express-rate-limit**. Demonstrates API abuse prevention with multiple rate limiting tiers, Redis-backed distributed store, automatic fallback to in-memory, and full interactive Swagger documentation.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

## Features

- **Multiple Rate Limit Tiers** — Global, Strict, and Auth-specific limiters with configurable windows and thresholds
- **Redis-Backed Distributed Store** — Consistent rate limiting across multiple instances using ioredis
- **Automatic Fallback** — Gracefully falls back to in-memory store when Redis is unavailable
- **Swagger UI** — Interactive API documentation at `/api-docs` powered by swagger-jsdoc and swagger-ui-express
- **Health Check** — Monitors API uptime and Redis connection status in real time
- **Rate Limit Management** — Check your current rate limit status and reset limits via dedicated API endpoints
- **Security Headers** — Helmet.js for HTTP security best practices (XSS, HSTS, CSP, etc.)
- **Graceful Shutdown** — Clean Redis disconnection and server close on SIGTERM/SIGINT signals
- **RFC Draft-7 Headers** — Standard `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` response headers

## Live Demo

[🚀 View Live API Docs](https://rate-limiter-api-p1y1.onrender.com/api-docs/)

> **Note:** The live demo is hosted on Render's free tier. The first request may take a few seconds to wake up the service.

## Technologies

- **Express.js (v5)** — Modern web framework for Node.js
- **express-rate-limit** — Flexible rate limiting middleware
- **rate-limit-redis** — Redis store adapter for distributed rate limiting
- **ioredis** — Robust Redis client with retry strategy and connection pooling
- **Helmet** — HTTP security headers middleware
- **CORS** — Cross-Origin Resource Sharing support
- **dotenv** — Environment variable management
- **swagger-jsdoc** — OpenAPI 3.0 spec generation from JSDoc comments
- **swagger-ui-express** — Interactive Swagger UI for API exploration
- **Nodemon** — Development server with hot reload
- **Render** — Cloud deployment platform with Redis support

## Installation

### Prerequisites

- **Node.js** 18 or higher
- **Redis** (optional — the API falls back to in-memory store automatically)

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/Serkanbyx/rate-limiter-api.git
cd rate-limiter-api
```

2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
```

5. Open the Swagger UI in your browser:

```
http://localhost:3000/api-docs
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Global rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |

## Usage

1. Start the server with `npm run dev` (development) or `npm start` (production)
2. Navigate to `http://localhost:3000/api-docs` to explore the interactive Swagger documentation
3. Send requests to any endpoint and observe the rate limit headers in the response
4. Hit the strict endpoint (`/api/protected`) rapidly to trigger the 429 Too Many Requests response
5. Use `/api/rate-limit/status` to check your current rate limit consumption
6. Use `/api/rate-limit/reset` to reset your rate limit counters

## How It Works?

### Rate Limiting Tiers

The API implements three distinct rate limiting tiers, each with its own window and threshold:

| Tier | Window | Max Requests | Applied To |
|---|---|---|---|
| **Global** | 15 min | 100 | All endpoints |
| **Strict** | 1 min | 10 | `/api/protected` |
| **Auth** | 15 min | 5 | `/api/auth/login` |

### Redis Store with Fallback

```javascript
// Redis-backed rate limiting with automatic fallback
const store = isRedisConnected()
  ? new RedisStore({ sendCommand: (...args) => redisClient.call(...args) })
  : undefined; // Falls back to in-memory store
```

When Redis is available, all rate limit counters are stored in Redis with prefixed keys (`rl:global:`, `rl:strict:`, `rl:auth:`), enabling distributed rate limiting across multiple server instances. If Redis is unavailable, the limiter falls back to an in-memory store automatically.

### Response Headers (RFC Draft-7)

Every response includes standard rate limit headers:

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 900
RateLimit-Policy: 100;w=900
```

### 429 Response

When the rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

## API Endpoints

| Method | Endpoint | Rate Limit | Description |
|---|---|---|---|
| `GET` | `/api-docs` | Global | Interactive Swagger documentation |
| `GET` | `/api/health` | Global | Health check with Redis status |
| `GET` | `/api/public` | Global | Public resource |
| `GET` | `/api/protected` | Global + Strict | Protected resource (strict rate limit) |
| `POST` | `/api/auth/login` | Global + Auth | Login simulation endpoint |
| `GET` | `/api/rate-limit/status` | Global | Check current rate limit status |
| `DELETE` | `/api/rate-limit/reset` | Global | Reset rate limit for an IP |

### Testing Rate Limits

You can test rate limiting by sending rapid requests:

```bash
# Hit the strict endpoint rapidly
for i in {1..15}; do curl -s http://localhost:3000/api/protected | head -c 80; echo; done

# Check your rate limit status
curl http://localhost:3000/api/rate-limit/status

# Reset your rate limit
curl -X DELETE http://localhost:3000/api/rate-limit/reset
```

## Deployment

### Render

1. Push this repository to GitHub
2. Connect the repository on [Render](https://render.com)
3. Render will auto-detect `render.yaml` and create both the web service and Redis instance
4. Set environment variables in Render dashboard if needed

The `render.yaml` blueprint includes:

- **Web Service** — Node.js app with auto-build on the free plan
- **Redis Instance** — Distributed rate limiting store with `allkeys-lru` eviction policy

## Project Structure

```
src/
├── config/
│   ├── env.js              # Environment variables loader
│   ├── redis.js            # Redis client with retry & fallback
│   └── swagger.js          # OpenAPI 3.0 spec configuration
├── controllers/
│   ├── apiController.js    # API endpoint handlers
│   └── healthController.js # Health check handler
├── middlewares/
│   ├── errorHandler.js     # Global error handler
│   └── rateLimiter.js      # Rate limiter factory (Redis/memory)
├── routes/
│   ├── apiRoutes.js        # API routes with Swagger JSDoc
│   └── healthRoutes.js     # Health check route
├── app.js                  # Express app setup & middleware
└── server.js               # Server entry point & graceful shutdown
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes using conventional commits:
   - `feat:` — New feature
   - `fix:` — Bug fix
   - `refactor:` — Code refactoring
   - `docs:` — Documentation changes
   - `chore:` — Maintenance tasks
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## Developer

**Serkan Bayraktar**

- [Website](https://serkanbayraktar.com/)
- [GitHub](https://github.com/Serkanbyx)
- [Email](mailto:serkanbyx1@gmail.com)

## Contact

- **Issues:** [GitHub Issues](https://github.com/Serkanbyx/rate-limiter-api/issues)
- **Email:** serkanbyx1@gmail.com
- **Website:** [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
