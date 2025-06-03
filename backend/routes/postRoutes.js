// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Get all posts
router.get('/', authenticateJWT, postController.getAllPosts);

// Get single post by ID
router.get('/:id', authenticateJWT, postController.getPostById);

// Create a new post
router.post('/', authenticateJWT, postController.createPost);

module.exports = router;