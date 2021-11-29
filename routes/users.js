const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  login,
  createUser,
  deleteUser,
  updateUser,
  getUser,
  getUsers
} = require("../controller/users");

const router = express.Router();

//"/api/v1/users"
router.route("/login").post(login);
router.route('/').get(getUsers);
router.route("/:id").get(getUser);

router.use(protect);
router.route("/create").post(createUser);
router.route("/update/:id").post(updateUser);
router.route("/delete/:id").post(deleteUser);


module.exports = router;
