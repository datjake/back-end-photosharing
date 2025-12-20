const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const multer = require("multer");
const router = express.Router();

// Cấu hình Multer để lưu ảnh vào thư mục 'images' (Problem 3)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images"); // Đảm bảo thư mục 'images' đã tồn tại ở gốc back-end
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất tránh trùng lặp
    cb(null, "U" + Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage: storage });

//Thêm comment cho ảnh
router.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  const { comment } = req.body;
  const photoId = req.params.photo_id;
  if (!comment || comment.trim() === "") {
    return res.status(400).send("Invalid comment");
  }
  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(400).send("Invalid photo");
    }
    const newComment = {
      comment: comment,
      date_time: new Date(),
      user_id: req.session.user._id,
    };
    photo.comments.push(newComment);
    await photo.save();
    return res.status(200).json(newComment);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

//Upload ảnh mới
router.post("/new", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file upload");
  }
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
});

// Lấy ảnh của user
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
