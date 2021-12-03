const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getorganizationLevels,
  createorganizationLevel,
  updateorganizationLevel,
  deleteorganizationLevel
} = require("../controller/organization_levels");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getorganizationLevels);
router.route('/create').post(authorize,createorganizationLevel);
router.route("/update/:id").post(authorize,updateorganizationLevel);
router.route("/delete/:id").post(authorize,deleteorganizationLevel);


module.exports = router;
