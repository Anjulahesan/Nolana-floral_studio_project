const { User } = require("../models");
const { HttpError } = require("../middleware/errorHandler");
const { signToken } = require("../middleware/auth");
const pick = require("../utils/pick");

// POST /api/auth/register  -> creates a "customer"
exports.register = async (req, res) => {
  const data = pick(req.body, ["fname", "lname", "email", "password", "contacts", "addresses"]);
  const user = await User.create(data);
  res.status(201).json({ token: signToken(user), user });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new HttpError(400, "email and password are required");

  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(401, "Invalid email or password");
  }
  res.json({ token: signToken(user), user });
};

// GET /api/auth/me
exports.me = async (req, res) => {
  res.json(req.user);
};

// PATCH /api/auth/password  { currentPassword, newPassword }
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) throw new HttpError(400, "currentPassword and newPassword are required");

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) throw new HttpError(401, "Current password is incorrect");

  user.password = newPassword;
  await user.save(); // re-hashed by the pre-save hook
  res.json({ message: "Password updated", token: signToken(user) });
};