const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getitems,
  createitem,
  updateitem,
  deleteitem,
  getItem, myItems, downloadItemFile, downloadMyItemFile,
  getItemByRequest,getConfirmedItems
} = require("../controller/items");

const router = express.Router();
console.log("---");
router.use(protect);
router.route('/').get(getitems);
router.route("/myitem").get(myItems);
//Батлагдсан гэрээнүүд
router.route('/confirmed').get(getConfirmedItems);
router.route('/:id').get(getItem);
//Хүсэлт хүлээн авсан хүн энэхүү файлыг татах
router.route('/request/:requestId').get(getItemByRequest)
router.route('/:itemId/:fileName').get(downloadItemFile);
//Хэрэглэгч өөрийнхөө гэрээний файлыг татах
router.route('/myitem/:itemId/:fileName').get(downloadMyItemFile);
router.route('/create').post(createitem);
// router.route("/update/:id").post(updateitem);
//Дахин гэрэээг засварлаж явуулах, тухайх хүсэлтийг шинээр үүсгэх/update ххийх/
router.route("/update/:itemId/:requestId").post(updateitem);
router.route("/delete/:id").post(deleteitem);

module.exports = router;
