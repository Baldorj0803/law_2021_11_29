const express = require("express");
const { protect } = require("../middleware/protect");
const {
  myApprovedContractPdf,
  approvedContractPdf,
  getConfirmFile,
  getMyConfirmFile,
  getContractIConfirm
} = require("../controller/download");
const { authorize } = require("../middleware/protect");

const router = express.Router();
// Approved my contract = миний батлагдсан гэрээ
// The Contract I approved = би баталсан гэрээ

router.use(protect);
//Өөрийн батлагдсан гэрээг татах
router.route("/myConfirm/:itemId").get(authorize, getMyConfirmFile);
//Батлагдсан гэрээг татах
router.route("/confirm/:itemId").get(authorize, getConfirmFile);
//Гэрээний хүсэлтэд засвар баталсан/цуцалсан/ хүн тухайн гэрээг татах
router.route('/items/:itemId/:fileName').get(authorize, getContractIConfirm);
//Батлагдсан гэрээний pdf татах
router.route("/item/:itemId/pdf/:fileName").get(authorize, approvedContractPdf);
//Миний батлагдсан гэрээний pdf татах
router.route("/mycontract/:itemId/pdf").get(authorize, myApprovedContractPdf);

module.exports = router;
