const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu
} = require("../controller/menus");

const router = express.Router();

//"/api/v1/users"
router.use(protect);
router.route('/').get(authorize, getMenus);
router.route('/create').post(authorize, createMenu);
router.route("/update/:id").post(authorize, updateMenu);
router.route("/delete/:id").post(authorize, deleteMenu);
module.exports = router;
