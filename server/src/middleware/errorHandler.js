const mongoose = require("mongoose");

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function notFound(req, res, next) {
  next(new HttpError(404, `Not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || "Internal server error";
  let details;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = "Validation failed";
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}: ${JSON.stringify(err.value)}`;
  } else if (err.code === 11000) {
    status = 409;
    message = `Duplicate value for: ${Object.keys(err.keyValue || {}).join(", ")}`;
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ error: message, ...(details && { details }) });
}

module.exports = { HttpError, notFound, errorHandler };
