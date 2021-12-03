const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getrequests,
  createrequest,
  updaterequest,
  deleterequest
} = require("../controller/request")

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getrequests);
router.route('/create').post(authorize,createrequest);
router.route("/update/:id").post(authorize,updaterequest);
router.route("/delete/:id").post(authorize,deleterequest);


module.exports = router;
