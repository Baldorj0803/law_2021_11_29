const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getreq_status,
  createreq_status,
  updatereq_status,
  deletereq_status
} = require("../controller/reqStatus");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getreq_status);
router.route('/create').post(authorize,createreq_status);
router.route("/update/:id").post(authorize,updatereq_status);
router.route("/delete/:id").post(authorize,deletereq_status);


module.exports = router;
