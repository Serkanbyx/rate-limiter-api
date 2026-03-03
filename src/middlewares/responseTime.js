/**
 * Measures request processing duration and exposes it
 * as the X-Response-Time header (in milliseconds).
 * Intercepts res.writeHead to inject the header before it's sent.
 */
const responseTime = (_req, res, next) => {
  const start = process.hrtime.bigint();
  const originalWriteHead = res.writeHead;

  res.writeHead = function (...args) {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;
    res.setHeader("X-Response-Time", `${duration.toFixed(2)}ms`);
    return originalWriteHead.apply(this, args);
  };

  next();
};

module.exports = responseTime;
