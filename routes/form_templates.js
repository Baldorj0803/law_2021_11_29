const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getform_templates,
  createform_template,
  updateform_template,
  deleteform_template,
  getform_template
} = require("../controller/form_templates");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getform_templates);
router.route("/:fileName").get(authorize,getform_template);
router.route('/create').post(authorize,createform_template);
router.route("/update/:id").post(authorize,updateform_template);
router.route("/delete/:id").post(authorize,deleteform_template);


module.exports = router;
