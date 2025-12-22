const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    cb(null, "U" + Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// MODIFIED: Problem 2 - Thêm comment cho ảnh
router.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  const { comment } = req.body;
  const photoId = req.params.photo_id;

  // Bảo vệ: Kiểm tra session và nội dung comment
  if (!req.session || !req.session.user)
    return res.status(401).send("Unauthorized");
  if (!comment || comment.trim() === "")
    return res.status(400).send("Invalid comment");

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(400).send("Invalid photo");

    const newComment = {
      comment: comment,
      date_time: new Date(),
      user_id: req.session.user._id,
    };

    photo.comments.push(newComment);
    await photo.save();

    // Lấy comment cuối cùng vừa lưu (để có đầy đủ các trường dữ liệu)
    const addedComment = photo.comments[photo.comments.length - 1];
    return res.status(200).json(addedComment);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// Hien thi danh sach cac comment cua nguoi dung hien tai
router.get("/commentOfUser/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const photos = await Photo.find({
      "comments.user_id": userId,
    }).select("_id file_name comments user_id");

    const result = [];

    photos.forEach((photo) => {
      photo.comments.forEach((c) => {
        if (c.user_id.toString() === userId) {
          result.push({
            comment_id: c._id,
            comment: c.comment,
            date_time: c.date_time,
            photo_id: photo.user_id,
            file_name: photo.file_name,
          });
        }
      });
    });

    res.json(result);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Problem 3: Upload ảnh mới
router.post(
  "/new",
  (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).send("Unauthorized");
    }
    next();
  },
  upload.single("photo"),
  async (req, res) => {
    if (!req.session || !req.session.user)
      return res.status(401).send("Unauthorized");
    if (!req.file) return res.status(400).send("No file upload");

    try {
      const newPhoto = await Photo.create({
        file_name: req.file.filename,
        date_time: new Date(),
        user_id: req.session.user._id,
        comments: [],
      });
      return res.status(200).json(newPhoto);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
);

// Lấy ảnh của user
router.get("/photosOfUser/:id", async (req, res) => {
  try {
    const photos = await Photo.find({ user_id: req.params.id })
      .populate("comments.user_id", "_id first_name last_name")
      .select("_id user_id file_name date_time comments");

    return res.json(photos);
  } catch (err) {
    return res.status(400).json({ message: "Error!" });
  }
});

module.exports = router;
