const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const { getregistrations, createregistration, updateregistration, deleteregistration } = require("../controller/registartions");

const router = express.Router();

console.log("routes");
router.use(protect);
router.route("/").get(getregistrations).post(createregistration)
router.route("/:id")
    .put(updateregistration)
    .delete(deleteregistration);

module.exports = router;
