const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getitems,
  createitem,
  updateitem,
  deleteitem,
  getItem,myItems
} = require("../controller/items");

const router = express.Router();

router.use(protect);
// router.route('/').get(authorize,getitems);
// router.route('/create').post(authorize,createitem);
// router.route("/update/:id").post(authorize,updateitem);
// router.route("/delete/:id").post(authorize,deleteitem);
router.route('/').get(getitems);
router.route("/myitem").get(myItems);
router.route('/:id').get(getItem);
router.route('/create').post(createitem);
router.route("/update/:id").post(updateitem);
router.route("/delete/:id").post(deleteitem);



module.exports = router;
