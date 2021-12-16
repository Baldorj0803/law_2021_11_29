const express = require("express");
const {protect} = require('../middleware/protect')
const {
  getConfirmFile,getMyConfirmFile
} = require("../controller/download");

const router = express.Router();

router.use(protect);
router.route('/myConfirm/:itemId').get(getMyConfirmFile);
router.route('/confirm/:itemId').get(getConfirmFile);

module.exports = router;
