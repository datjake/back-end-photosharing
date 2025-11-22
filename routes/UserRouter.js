const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

router.get("/list", async (request, response) => {
  const data = await User.find({}, "_id first_name last_name");
  return response.json(data);
});

router.get("/:id", async (req, res) => {
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

module.exports = router;
