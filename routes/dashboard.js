const express = require("express");
const {
  totalStat,
  getRequestProcess,
  getItemDetail
} = require("../controller/dashboard");
const {protect,authorize} = require('../middleware/protect')

const router = express.Router();

router.route('/totalStat').get(totalStat);
router.route('/process').get(getRequestProcess);
router.route('/getItemDetail').get(getItemDetail);

module.exports = router;
