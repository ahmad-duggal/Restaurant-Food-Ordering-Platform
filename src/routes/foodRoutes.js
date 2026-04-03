const express = require("express");
const router = express.Router();

const {
  addfood,
  getallfood,
  updatefood,
  deletefood,
} = require("../controllers/foodController");
const { validatefood } = require("../middleware/validator");
const { protect, authorize } = require("../middleware/usermiddleware");

router
  .route("/")
  .get(getallfood)
  .post(protect, authorize("admin"), validatefood, addfood);

router
  .route("/:id")
  .put(protect, validatefood, updatefood)
  .delete(protect, deletefood);

module.exports = router;
