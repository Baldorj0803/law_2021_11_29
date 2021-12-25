const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const { getregistrations, createregistration, updateregistration, deleteregistration } = require("../controller/registartions");

const router = express.Router();

router.use(protect);
router.route("/").get(authorize, getregistrations).post(authorize, createregistration)
router.route("/:id")
    .put(authorize, updateregistration)
    .delete(authorize, deleteregistration);

module.exports = router;
