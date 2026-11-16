const { Router } = require("express");
const ctrl = require("../controllers/user.controller");
const { protect, authorize, selfOrAdmin } = require("../middleware/auth");

const router = Router();

router.use(protect);    // Every user needs to logged-in user

router.route("/")
    .get(authorize("admin"), ctrl.list)
    .post(authorize("admin"), ctrl.create);

router.route("/:id")
    .get(selfOrAdmin(), ctrl.get)
    .patch(selfOrAdmin(), ctrl.update)
    .delete(selfOrAdmin(), ctrl.remove);

router.get("/:id/orders", selfOrAdmin(), ctrl.orders);
router.post("/:id/contacts", selfOrAdmin(), ctrl.addContact);
router.delete("/:id/contacts/:contactId", selfOrAdmin(), ctrl.removeContact);

module.exports = router;