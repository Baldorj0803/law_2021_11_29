const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getresponses,
  createresponse,
  updateresponse,
  deleteresponse
} = require("../controller/responses");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getresponses);
router.route('/create').post(authorize,createresponse);
router.route("/update/:id").post(authorize,updateresponse);
router.route("/delete/:id").post(authorize,deleteresponse);


module.exports = router;
