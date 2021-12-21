const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const { getregistrations,createregistration,updateregistration,deleteregistration } = require("../controller/registartions");

const router = express.Router();

router.use(protect);
router.route("/").get(getregistrations);
router.route("/create").post(createregistration);
router.route("/update/:id").put(updateregistration);
router.route("/delete/:id").delete(deleteregistration);

module.exports = router;
