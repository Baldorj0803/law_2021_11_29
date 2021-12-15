const express = require("express");
const {protect} = require('../middleware/protect')
const {
  getConfirmFile
} = require("../controller/download");

const router = express.Router();

router.use(protect);
router.route('/myConfirm/:itemId').get(getConfirmFile);

module.exports = router;
