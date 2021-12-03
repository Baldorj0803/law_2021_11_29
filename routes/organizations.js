const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getorganizations,
  createorganization,
  updateorganization,
  deleteorganization
} = require("../controller/organizations");

const router = express.Router();

router.use(protect);
// router.route('/').get(authorize,getorganizations);
// router.route('/create').post(authorize,createorganization);
// router.route("/update/:id").post(authorize,updateorganization);
// router.route("/delete/:id").post(authorize,deleteorganization);
router.route('/').get(getorganizations);
router.route('/create').post(authorize,createorganization);
router.route("/update/:id").post(authorize,updateorganization);
router.route("/delete/:id").post(authorize,deleteorganization);


module.exports = router;
