const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getcurrencies,
  createcurrencies,
  updatecurrencies,
  deletecurrencies
} = require("../controller/currencies");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getcurrencies);
router.route('/create').post(authorize,createcurrencies);
router.route("/update/:id").post(authorize,updatecurrencies);
router.route("/delete/:id").post(authorize,deletecurrencies);


module.exports = router;
