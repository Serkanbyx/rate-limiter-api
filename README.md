# Rate Limiter API

A distributed Rate Limiter API built with **Express**, **Redis**, and **express-rate-limit**. Demonstrates API abuse prevention with multiple rate limiting tiers and full Swagger documentation.

## Features

- **Multiple rate limit tiers** — Global, Strict, and Auth-specific limiters
- **Redis-backed distributed store** — Consistent rate limiting across multiple instances
- **Automatic fallback** — Falls back to in-memory store when Redis is unavailable
- **Swagger UI** — Interactive API documentation at `/api-docs`
- **Health check** — Monitors API and Redis connection status
- **Rate limit management** — Check status and reset limits via API
- **Security headers** — Helmet.js for HTTP security best practices
- **Graceful shutdown** — Clean Redis disconnection on process termination

## Tech Stack

| Technology | Purpose |
|---|---|
| Express.js | Web framework |
| express-rate-limit | Rate limiting middleware |
| rate-limit-redis | Redis store adapter |
| ioredis | Redis client |
| Swagger (swagger-jsdoc + swagger-ui-express) | API documentation |
| Helmet | Security headers |
| Render | Deployment platform |

## Rate Limiting Tiers

| Tier | Window | Max Requests | Applied To |
|---|---|---|---|
| **Global** | 15 min | 100 | All endpoints |
| **Strict** | 1 min | 10 | `/api/protected` |
| **Auth** | 15 min | 5 | `/api/auth/login` |

## API Endpoints

| Method | Endpoint | Rate Limit | Description |
|---|---|---|---|
| `GET` | `/api-docs` | Global | Swagger documentation |
| `GET` | `/api/health` | Global | Health check |
| `GET` | `/api/public` | Global | Public resource |
| `GET` | `/api/protected` | Global + Strict | Protected resource |
| `POST` | `/api/auth/login` | Global + Auth | Login simulation |
| `GET` | `/api/rate-limit/status` | Global | Check rate limit status |
| `DELETE` | `/api/rate-limit/reset` | Global | Reset rate limit for IP |

## Getting Started

### Prerequisites

- Node.js 18+
- Redis (optional — falls back to in-memory)

### Installation

```bash
git clone <repository-url>
cd rate-limiter-api
npm install
```

### Configuration

Copy the example env file and adjust values:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |

### Running

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Visit `http://localhost:3000/api-docs` for interactive Swagger documentation.

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

## Deployment (Render)

1. Push this repository to GitHub
2. Connect the repository on [Render](https://render.com)
3. Render will auto-detect `render.yaml` and create both the web service and Redis instance
4. Set environment variables in Render dashboard if needed

The `render.yaml` blueprint includes:
- **Web Service** — Node.js app with auto-build
- **Redis Instance** — For distributed rate limiting

## Response Headers

Rate limit information is included in response headers (RFC draft-7):

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 900
RateLimit-Policy: 100;w=900
```

## Project Structure

```
src/
├── config/
│   ├── env.js          # Environment variables
│   ├── redis.js        # Redis client setup
│   └── swagger.js      # Swagger/OpenAPI spec
├── controllers/
│   ├── apiController.js    # API endpoint handlers
│   └── healthController.js # Health check handler
├── middlewares/
│   ├── errorHandler.js # Global error handler
│   └── rateLimiter.js  # Rate limiter configurations
├── routes/
│   ├── apiRoutes.js    # API routes with Swagger docs
│   └── healthRoutes.js # Health route
├── app.js              # Express app setup
└── server.js           # Server entry point
```

## License

ISC
