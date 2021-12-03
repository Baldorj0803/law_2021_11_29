const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getrequest,
  createrange,
  updaterange,
  deleterange
} = require("../controller/request");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getrequest);
router.route('/create').post(authorize,createrange);
router.route("/update/:id").post(authorize,updaterange);
router.route("/delete/:id").post(authorize,deleterange);


module.exports = router;
