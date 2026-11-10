const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { HttpError } = require("./errorHandler");

// Authentication: requires a valid "Authorization: Bearer <token>"
async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) throw new HttpError(401, "Not authenticated: missing Bearer token");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Not authenticated: invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, "Not authenticated: user no longer exists");

  req.user = user;
  next();
}

// Authorization: Only allow the given roles
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new HttpError(403, "Forbidden: insufficient permissions");
    }
    next();
  };
}

// The user in :id must be the logged-in user, or the caller is an admin.
function selfOrAdmin(param = "id") {
  return (req, res, next) => {
    if (req.user.role === "admin" || String(req.user._id) === String(req.params[param])) return next();
    throw new HttpError(403, "Forbidden: you can only access your own account");
  };
}

function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

module.exports = { protect, authorize, selfOrAdmin, signToken };
