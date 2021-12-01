const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getOrganizations
} = require("../controller/organizations");

const router = express.Router();

router.use(protect);
router.route('/').get(getOrganizations);


module.exports = router;
