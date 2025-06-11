// routes/postRoutes.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { getLatestNotifications } = require('../controllers/notificationController');

//Multer setup for file uploads
// const storage = multer.diskStorage({
// destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, '..', 'uploads');
//     if (!fs.existsSync(uploadPath)) {
//     fs.mkdirSync(uploadPath, { recursive: true }); // Ensure upload directory exists
//     }
//     cb(null, uploadPath);
// },
// filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
// },
// });
// const upload = multer({ storage });
// const storage = multer.memoryStorage(); // ✅ Uses in-memory buffer (safe for Firebase)

// const upload = multer({ storage });

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

// routes/postRoutes.js
router.post('/upload', authenticateJWT, async (req, res) => {
  try {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', async () => {
      const { base64, fileType } = JSON.parse(data); // base64 = data:image/png;base64,xxx

      const uploaded = await cloudinary.uploader.upload(base64, {
        resource_type: fileType.startsWith("video") ? "video" : "image",
      });

      res.json({ filePath: uploaded.secure_url });
    });
  } catch (err) {
    console.error("☠️ Upload failed:", err);
    res.status(500).json({ message: "Upload to cloudinary failed" });
  }
});


module.exports = router;