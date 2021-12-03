const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getitems,
  createitem,
  updateitem,
  deleteitem
} = require("../controller/items");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getitems);
router.route('/create').post(authorize,createitem);
router.route("/update/:id").post(authorize,updateitem);
router.route("/delete/:id").post(authorize,deleteitem);


module.exports = router;
