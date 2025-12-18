const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../db/userModel");
const router = express.Router();
