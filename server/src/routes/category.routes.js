const { Router } = require("express");
const ctrl = require("../controllers/category.controller");
const { protect, authorize } = require("../middleware/auth");

const router = Router();
const adminOnly = [protect, authorize("admin")];

router.route("/")
  .get(ctrl.list) // public
  .post(...adminOnly, ctrl.create);

router.route("/:id")
  .get(ctrl.get) // public
  .patch(...adminOnly, ctrl.update)
  .delete(...adminOnly, ctrl.remove);

module.exports = router;