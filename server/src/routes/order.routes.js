const { Router } = require("express");
const ctrl = require("../controllers/order.controller");
const { protect, authorize } = require("../middleware/auth");

const router = Router();

router.use(protect); 

router.get("/reports/top-products", authorize("admin"), ctrl.topProducts);

router.route("/")
  .get(ctrl.list)
  .post(ctrl.create);

router.route("/:id")
  .get(ctrl.get)
  .patch(ctrl.update)
  .delete(authorize("admin"), ctrl.remove);

router.patch("/:id/status", authorize("admin"), ctrl.updateStatus);
router.patch("/:id/cancel", ctrl.cancel);

module.exports = router;
