const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getitem_types,
  createitem_type,
  updateitem_type,
  deleteitem_type
} = require("../controller/item_types");

const router = express.Router();

router.use(protect);
router.route('/').get(authorize,getitem_types);
router.route('/create').post(authorize,createitem_type);
router.route("/update/:id").post(authorize,updateitem_type);
router.route("/delete/:id").post(authorize,deleteitem_type);


module.exports = router;
