const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../db/userModel");
const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;
  if (!login_name || !password) {
    return res.status(400).send("Username or password invalid");
  }

  const user = await User.findOne({ login_name });
  if (!user) {
    return res.status(400).send("Wrong user");
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).send("Wrong password");
  }
  req.session.user = {
    _id: user._id,
    first_name: user.first_name,
  };
  res.json({
    _id: user._id,
    first_name: user.first_name,
  });
});

// Logout
router.post("/logout", (req, res) => {
  if (!req.session.user) {
    return res.status(400).send("Not logged in");
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    res.sendStatus(200);
  });
});


module.exports = router;
