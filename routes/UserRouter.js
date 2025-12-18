const express = require("express");
const User = require("../db/userModel");
const router = express.Router();
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth.js");

// Danh sach nguoi dung
router.get("/list", auth, async (req, res) => {
  const data = await User.find({}, "_id first_name last_name");
  return res.json(data);
});

//Chi tiet nguoi dung
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "_id first_name last_name location description occupation"
    );
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Invalid user id" });
  }
});

//Dang ki nguoi dung

module.exports = router;
