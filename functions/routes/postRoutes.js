// routes/postRoutes.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { getLatestNotifications } = require('../controllers/notificationController');
const cloudinary = require('../utils/cloudinary');

router.use(express.json());
// Enable CORS properly for Cloud Functions
router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // 👈 Or use specific origin
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === 'OPTIONS') return res.sendStatus(200); // Pre-flight
  next();
});

router.post('/upload', authenticateJWT, async (req, res) => {
  try {
    const { base64, fileType } = req.body;

    const uploaded = await cloudinary.uploader.upload(base64, {
      resource_type: fileType.startsWith("video") ? "video" : "image",
    });

    res.json({ filePath: uploaded.secure_url });
  } catch (err) {
    console.error("☠️ Upload failed:", err.message);
    res.status(500).json({ message: "Upload to Cloudinary failed" });
  }
});

// Get all posts
router.get('/', authenticateJWT, postController.getAllPosts);

// Get single post by ID
router.get('/:id', authenticateJWT, postController.getPostById);

// Create a new post
 router.post('/', authenticateJWT, postController.createPost);

// Update post
router.put('/:id', authenticateJWT, postController.updatePost);

// Delete User
router.delete('/:id', authenticateJWT, postController.deletePost);

router.get('/notifications', authenticateJWT, getLatestNotifications);

module.exports = router;