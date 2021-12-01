const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getRoles,
  createRole,
  updateRole,
  deleteRole
} = require("../controller/roles");

const router = express.Router();

//"/api/v1/users"
router.use(protect);
// router.route('/').get(authorize,getRoles);
// router.route('/create').post(authorize,createRole);
// router.route("/update/:id").post(authorize,updateRole);
// router.route("/delete/:id").post(authorize,deleteRole);
router.route('/').get(getRoles);
router.route('/create').post(createRole);
router.route("/update/:id").post(updateRole);
router.route("/delete/:id").post(deleteRole);


module.exports = router;
