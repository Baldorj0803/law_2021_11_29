const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getworkflow_templates,
  createworkflow_template,
  updateworkflow_template,
  deleteworkflow_template
} = require("../controller/workflow_templates");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getworkflow_templates);
router.route('/create').post(authorize,createworkflow_template);
router.route("/update/:id").post(authorize,updateworkflow_template);
router.route("/delete/:id").post(authorize,deleteworkflow_template);


module.exports = router;
