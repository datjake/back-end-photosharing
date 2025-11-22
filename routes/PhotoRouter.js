const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();

router.post("/", async (request, response) => {});

router.get("/photosOfUser/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Not found!" });
    }
    const photos = await Photo.find({
      user_id: req.params.id,
    }).select("_id user_id file_name date_time comments");
    return res.json(photos);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error!" });
  }
});

module.exports = router;
