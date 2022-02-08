const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const { getcontracttypes } = require("../controller/utils");

const router = express.Router();

//"/api/v1/utils"
router.route("/contracttypes").get(getcontracttypes);

module.exports = router;
