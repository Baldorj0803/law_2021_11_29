const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const { myApprovedContractPdf } = require("../controller/upload");

const router = express.Router();

router.use(protect);
//Миний батлагдсан гэрээний pdf оруулах
router.route("/:itemId/pdf").post(authorize, myApprovedContractPdf);
module.exports = router;
