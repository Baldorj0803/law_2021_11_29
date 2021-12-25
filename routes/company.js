const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getcompanies,
  createcompany,
  updatecompany,
  deletecompany
} = require("../controller/company");

const router = express.Router();

router.use(protect);
// router.route('/').get(authorize,getcompanies);
router.route('/').get(getcompanies);
router.route('/create').post(authorize,createcompany);
router.route("/update/:id").post(authorize,updatecompany);
router.route("/delete/:id").post(authorize,deletecompany);


module.exports = router;
