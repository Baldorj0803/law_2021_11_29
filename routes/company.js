const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getcompany,
  createcompany,
  updatecompany,
  deletecompany
} = require("../controller/company");

const router = express.Router();

router.use(protect);
router.route('/').get(getcompany);
router.route('/create').post(createcompany);
router.route("/update/:id").post(updatecompany);
router.route("/delete/:id").post(deletecompany);


module.exports = router;
