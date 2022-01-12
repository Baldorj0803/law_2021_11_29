const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getrequests,
  getrequest,
  createrequest,
  updaterequest,
  deleterequest,
  downloadRequestFile,
} = require("../controller/request")

const router = express.Router();

router.use(protect);
//Над дээр ирсэн гэрээний хүсэлтүүд
router.route('/').get(authorize, getrequests);
//Над дээр ирсэн гэрээний хүсэлт
router.route('/:requestId').get(authorize, getrequest);
//Над дээр ирсэн хүсэлтийн гэрээний файл
router.route('/:requestId/:fileName').get(authorize, downloadRequestFile);
router.route('/create').post(authorize, createrequest);
router.route("/update/:id").post(authorize, updaterequest);
router.route("/delete/:id").post(authorize, deleterequest);


module.exports = router;
