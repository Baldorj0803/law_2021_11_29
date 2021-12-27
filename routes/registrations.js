const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getregistrations,
  createregistration,
  updateregistration,
  deleteregistration,
} = require("../controller/registartions");

const router = express.Router();

router.use(protect);
router.route("/").get(authorize, getregistrations);
router.route("/create").post(authorize, createregistration);
router.route("/update/:id").post(authorize, updateregistration);
router.route("/delete/:id").post(authorize, deleteregistration);

module.exports = router;
