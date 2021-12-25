const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const { getPermissions, createPermission, updatePermission, deletePermission } = require("../controller/permissions");

const router = express.Router();

router.use(protect);
router.route("/").get(authorize, getPermissions);
router.route("/create").post(authorize, createPermission);
router.route("/update/:id").post(authorize, updatePermission);
router.route("/delete/:id").post(authorize, deletePermission);

module.exports = router;
