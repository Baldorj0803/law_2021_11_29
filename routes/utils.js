const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const { getcontracttypes, sendEmail } = require("../controller/utils");

const router = express.Router();
router.use(protect);
//"/api/v1/utils"
router.route("/contracttypes").get(getcontracttypes);

router.route("/sendEmail").post(authorize, sendEmail)

module.exports = router;
