const express = require("express");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");
const router = express.Router();
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth.js");

// Danh sach nguoi dung
router.get("/list", async (req, res) => {
  const data = await User.find({}, "_id first_name last_name");
  return res.json(data);
});

//Chi tiet nguoi dung
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "_id first_name last_name location description occupation"
    );
    // Dem so photo
    const photoCount = await Photo.countDocuments({ user_id: user._id });
    const photos = await Photo.find(
      { "comments.user_id": user._id },
      { comments: 1 }
    );

    // Dem so comment
    let commentCount = 0;
    photos.forEach((p) => {
      p.comments.forEach((c) => {
        if (c.user_id.toString() === user._id.toString()) {
          commentCount++;
        }
      });
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.json({
      ...user.toObject(),
      photoCount,
      commentCount,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Invalid user id" });
  }
});

//Dang ki nguoi dung
router.post("/register", async (req, res) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation,
  } = req.body;
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).send("Missing informations");
  }
  const existing = await User.findOne({ login_name });
  if (existing) {
    return res.status(400).send("Account existing");
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    login_name,
    password: hash,
    first_name,
    last_name,
    location,
    description,
    occupation,
  });
  return res.json({ login_name: user.login_name });
});

module.exports = router;
