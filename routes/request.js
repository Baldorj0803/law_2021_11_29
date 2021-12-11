const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getrequests,
  getrequest,
  createrequest,
  updaterequest,
  deleterequest,
  downloadRequestFile
} = require("../controller/request")

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getrequests);
router.route('/:requestId').get(authorize,getrequest);
router.route('/:requestId/:fileName').get(authorize,downloadRequestFile);
router.route('/create').post(authorize,createrequest);
router.route("/update/:id").post(authorize,updaterequest);
router.route("/delete/:id").post(authorize,deleterequest);


module.exports = router;
