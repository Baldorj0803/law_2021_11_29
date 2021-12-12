const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getworkflows,
  createworkflow,
  updateworkflow,
  deleteworkflow
} = require("../controller/workflows");

const router = express.Router();

router.route('/').get(getworkflows);
router.use(protect);
router.route('/create').post(authorize,createworkflow);
router.route("/update/:id").post(authorize,updateworkflow);
router.route("/delete/:id").post(authorize,deleteworkflow);


module.exports = router;
