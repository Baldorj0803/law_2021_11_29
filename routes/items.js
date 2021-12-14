const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getitems,
  createitem,
  updateitem,
  deleteitem,
  getItem,myItems,downloadItemFile,downloadMyItemFile
} = require("../controller/items");

const router = express.Router();

router.use(protect);
router.route('/').get(getitems);
router.route("/myitem").get(myItems);
router.route('/:id').get(getItem);
//Хүсэлт хүлээн авсан хүн энэхүү файлыг татах
router.route('/:itemId/:fileName').get(downloadItemFile);
console.log("------------")
//Хэрэглэгч өөрийнхөө гэрээний файлыг татах
router.route('/myitem/:itemId/:fileName').get(downloadMyItemFile);
router.route('/create').post(createitem);
router.route("/update/:id").post(updateitem);
router.route("/delete/:id").post(deleteitem);

module.exports = router;
