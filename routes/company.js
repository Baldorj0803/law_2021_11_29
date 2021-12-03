const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getcompany,
  createcompany,
  updatecompany,
  deletecompany
} = require("../controller/company");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getcompany);
router.route('/create').post(authorize,createcompany);
router.route("/update/:id").post(authorize,updatecompany);
router.route("/delete/:id").post(authorize,deletecompany);


module.exports = router;
