const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Public read
router.get('/', authenticateJWT, postController.getAllPosts);

// Protected modify
router.post('/', authenticateJWT, postController.createPost);
router.put('/:id', authenticateJWT, postController.updatePost);
router.delete('/:id', authenticateJWT, postController.deletePost);

module.exports = router;
