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
router.route('/').get(getform_templates);
// router.route('/').get(authorize,getform_templates);
router.route("/:fileName").get(getform_template);
router.route('/create').post(createform_template);
router.route("/update/:id").post(updateform_template);
router.route("/delete/:id").post(deleteform_template);


module.exports = router;
