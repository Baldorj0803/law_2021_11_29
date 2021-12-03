const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getstatus,
  createstatus,
  updatestatus,
  deletestatus
} = require("../controller/status");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getstatus);
router.route('/create').post(authorize,createstatus);
router.route("/update/:id").post(authorize,updatestatus);
router.route("/delete/:id").post(authorize,deletestatus);


module.exports = router;
