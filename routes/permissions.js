const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const { getPermissions } = require("../controller/permissions");

const router = express.Router();

router.use(protect);
router.route("/").get(getPermissions);

module.exports = router;
