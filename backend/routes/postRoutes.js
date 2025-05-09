// // routes/postRoutes.js
// const express = require('express');
// const router = express.Router();
// const { authenticateJWT, checkPermission } = require('../middleware/authMiddleware');
// const postController = require('../controllers/postController');

// router.post('/create', authenticateJWT, checkPermission('create_post'), postController.createPost);


//   // ✅ READ ALL POSTS (no restriction)
// router.get('/', authenticateJWT, async (req, res) => {
//   try {
//     const posts = await Post.find().populate('client').populate('createdBy');
//     res.json(posts);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching posts' });
//   }
// });

// module.exports = router;

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
