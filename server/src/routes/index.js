const { Router } = require("express");

const router = Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/categories", require("./category.routes"));
router.use("/products", require("./product.routes"));
router.use("/orders", require("./order.routes"));

module.exports = router;