// routes/postRoutes.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { getLatestNotifications } = require('../controllers/notificationController');
const Notification = require('../models/Notification');

//Multer setup for file uploads
const storage = multer.diskStorage({
destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true }); // Ensure upload directory exists
    }
    cb(null, uploadPath);
},
filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
},
});
const upload = multer({ storage });

// Get all posts
router.get('/', authenticateJWT, postController.getAllPosts);

// Get single post by ID
router.get('/:id', authenticateJWT, postController.getPostById);

// Create a new post
router.post('/', authenticateJWT, upload.single('file'), postController.createPost);

// Update post
router.put('/:id', authenticateJWT, upload.single('file'), postController.updatePost);


// Delete User
router.delete('/:id', authenticateJWT, postController.deletePost);

router.get('/notifications', authenticateJWT, getLatestNotifications);

module.exports = router;