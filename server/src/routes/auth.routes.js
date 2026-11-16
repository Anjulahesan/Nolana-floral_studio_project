const { Router } = require("express");
const ctrl = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

const router = Router();

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/me", protect, ctrl.me);
router.patch("/password", protect, ctrl.changePassword);

module.exports = router;