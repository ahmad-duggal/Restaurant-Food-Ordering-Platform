const express = require("express");
const router = express.Router();

const {
  addfood,
  getallfood,
  getsinglefood,
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
  .get(getsinglefood)
  .put(protect, authorize("admin"), validatefood, updatefood)
  .delete(protect, authorize("admin"), deletefood);

module.exports = router;
