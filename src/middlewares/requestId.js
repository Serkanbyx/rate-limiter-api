const { randomUUID } = require("crypto");

/**
 * Attaches a unique X-Request-Id header to every request/response pair.
 * If the client already sends an X-Request-Id, it is preserved.
 */
const requestId = (req, res, next) => {
  const id = req.headers["x-request-id"] || randomUUID();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
};

module.exports = requestId;
