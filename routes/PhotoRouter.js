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
  if (!req.session || !req.session.user) return res.status(401).send("Unauthorized");
  if (!comment || comment.trim() === "") return res.status(400).send("Invalid comment");

  try {
    const photo = await Photo.findById(photoId);
    ;
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

// Problem 3: Upload ảnh mới
router.post("/new",(req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).send("Unauthorized");
  }
  next();
}, upload.single("photo"), async (req, res) => {
  if (!req.session || !req.session.user) return res.status(401).send("Unauthorized");
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
});

// Lấy ảnh của user
router.get("/photosOfUser/:id", async (req, res) => {
  try {
    const photos = await Photo.find({ user_id: req.params.id }).populate("comments.user_id", "_id first_name last_name").select("_id user_id file_name date_time comments");

    return res.json(photos);
  } catch (err) {
    return res.status(400).json({ message: "Error!" });
  }
});

// 2. Xóa Comment
router.delete("/comments/:photo_id/:comment_id", async (req, res) => {
  if (!req.session.user) return res.status(401).send("Unauthorized");
  try {
    const photo = await Photo.findById(req.params.photo_id);
    const comment = photo.comments.id(req.params.comment_id);
    
    // Bảo vệ: Chỉ người tạo comment mới được xóa
    if (comment.user_id.toString() !== req.session.user._id) {
      return res.status(403).send("Bạn không có quyền xóa comment này");
    }
    
    comment.remove(); // Xóa comment khỏi mảng
    await photo.save();
    res.status(200).send("Deleted");
  } catch (err) { res.status(500).send(err.message); }
});

// 3. Sửa Comment
router.put("/comments/:photo_id/:comment_id", async (req, res) => {
  if (!req.session.user) return res.status(401).send("Unauthorized");
  const { newText } = req.body;
  try {
    const photo = await Photo.findById(req.params.photo_id);
    const comment = photo.comments.id(req.params.comment_id);
    
    if (comment.user_id.toString() !== req.session.user._id) {
      return res.status(403).send("Không có quyền sửa");
    }
    
    comment.comment = newText;
    await photo.save();
    res.status(200).json(comment);
  } catch (err) { res.status(500).send(err.message); }
});

module.exports = router;