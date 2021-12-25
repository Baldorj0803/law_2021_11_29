const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  login,
  createUser,
  deleteUser,
  updateUser,
  getUser,
  getUsers,updatePassword
} = require("../controller/users");

const router = express.Router();

//"/api/v1/users"
router.route("/login").post(login);
router.use(protect)
router.route("/update/password").post(authorize,updatePassword);
router.route("/create").post(authorize,createUser);
router.route('/').get(authorize,getUsers);
router.route("/:id").get(authorize,getUser);
router.route("/update/:id").post(authorize,updateUser);
router.route("/delete/:id").post(authorize,deleteUser);


module.exports = router;
