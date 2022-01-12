const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getitems,
  createitem,
  updateitem,
  deleteitem,
  getItem, myItems, downloadMyItemFile,
  getMyItemByRequest, getConfirmedItems,
  downloadMyItemSubFile
} = require("../controller/items");

const router = express.Router();
router.use(protect);
//Хэрэглэгч өөрийнхөө гэрээний файлыг татах
router.route('/myitem/:itemId/file/:fileName').get(downloadMyItemFile);
//Хэрэглэгч өөрийнхөө гэрээний хавсралт файлыг татах
router.route('/myitem/:itemId/subFile/:fileName').get(downloadMyItemSubFile);
router.route('/').get(authorize, getitems);
router.route("/myitem").get(authorize, myItems);
//Батлагдсан гэрээнүүд
router.route('/confirmed').get(authorize, getConfirmedItems);
router.route('/:id').get(authorize, getItem);
//Хүсэлт хүлээн авсан хүн энэхүү файлыг татах
router.route('/request/:requestId').get(authorize, getMyItemByRequest);

router.route('/create').post(authorize, createitem);
// router.route("/update/:id").post(updateitem);
//Дахин гэрэээг засварлаж явуулах, тухайх хүсэлтийг шинээр үүсгэх/update ххийх/
router.route("/update/:itemId/:requestId").post(authorize, updateitem);
router.route("/delete/:id").post(authorize, deleteitem);

module.exports = router;
