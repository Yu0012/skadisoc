// routes/postRoutes.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateJWT } = require('../middleware/authMiddleware');

//Multer setup for file uploads
const storage = multer.diskStorage({
destination: (req, file, cb) => {
    const uploadPath = "/uploads/";
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
router.put('/:id', authenticateJWT, postController.updatePost);

// Delete User
router.delete('/:id', authenticateJWT, postController.deletePost);

module.exports = router;