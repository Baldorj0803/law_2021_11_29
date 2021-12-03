const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getorganization_levels,
  createorganization_level,
  updateorganization_level,
  deleteorganization_level
} = require("../controller/organization_levels");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getorganization_levels);
router.route('/create').post(authorize,createorganization_level);
router.route("/update/:id").post(authorize,updateorganization_level);
router.route("/delete/:id").post(authorize,deleteorganization_level);


module.exports = router;
