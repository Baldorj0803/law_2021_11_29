const express = require("express");
const { protect } = require("../middleware/protect");
const {
  myApprovedContractPdf,
  approvedContractPdf,
  getConfirmFile,
  getMyConfirmFile,
} = require("../controller/download");
const { authorize } = require("../middleware/protect");

const router = express.Router();

router.use(protect);
//Өөрийн батлагдсан гэрээг татах
router.route("/myConfirm/:itemId").get(authorize, getMyConfirmFile);
//Батлагдсан гэрээг татах
router.route("/confirm/:itemId").get(authorize, getConfirmFile);
//Батлагдсан гэрээний pdf татах
router.route("/item/:itemId/pdf/:fileName").get(authorize, approvedContractPdf);
//Миний батлагдсан гэрээний pdf татах
router.route("/mycontract/:itemId/pdf").get(authorize, myApprovedContractPdf);

module.exports = router;
