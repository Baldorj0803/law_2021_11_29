const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getrole_has_permissions,
  createrole_has_permission,
  updaterole_has_permission,
  deleterole_has_permission
} = require("../controller/roleHasPermissions");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getrole_has_permissions);
router.route('/create').post(authorize,createrole_has_permission);
router.route("/update/:id").post(authorize,updaterole_has_permission);
router.route("/delete/:id").post(authorize,deleterole_has_permission);


module.exports = router;
