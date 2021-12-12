const express = require("express");
const {
  totalStat,
  getRequestProcess,
  getItemDetail
} = require("../controller/dashboard");

const router = express.Router();

router.route('/totalStat').get(totalStat);
router.route('/process/:workflowId').get(getRequestProcess);
router.route('/getItemDetail').get(getItemDetail);

module.exports = router;
