const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getroleHasPermissions,
  createroleHasPermission,
  updateroleHasPermission,
  deleteroleHasPermission
} = require("../controller/roleHasPermissions");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getroleHasPermissions);
router.route('/create').post(authorize,createroleHasPermission);
router.route("/update/:id").post(authorize,updateroleHasPermission);
router.route("/delete/:id").post(authorize,deleteroleHasPermission);


module.exports = router;
