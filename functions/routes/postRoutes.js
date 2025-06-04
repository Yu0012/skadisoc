const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const fs = require('fs');
const multer = require('multer');


// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
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


// ✅ GET all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({});
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching all posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// ✅ schedule a post
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, content, client, scheduledDate } = req.body;

    let selectedPlatforms = [];
    if (req.body.selectedPlatforms) {
      try {
        selectedPlatforms = JSON.parse(req.body.selectedPlatforms);
      } catch (err) {
        console.error("Invalid selectedPlatforms:", err);
      }
    }

    const parsedDate = scheduledDate ? new Date(scheduledDate) : null;

    const newPost = new Post({
      title,
      content,
      client,
      scheduledDate: parsedDate,
      selectedPlatforms,
      posted: false,
      status: parsedDate ? 'scheduled' : 'draft',
      filePath: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newPost.save();

    res.status(201).json({ message: "Post scheduled successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// ✅ GET scheduled posts
router.get('/scheduled', async (req, res) => {
  try {
    const now = new Date();
    const posts = await Post.find({ scheduledDate: { $lte: now }, posted: false });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    res.status(500).json({ error: "Failed to fetch scheduled posts" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

router.get("/", async (req, res) => {
  try {
    const { clientId, platform } = req.query;
    if (!clientId || !platform) {
      return res.status(400).json({ error: "Missing clientId or platform" });
    }

    const posts = await Post.find({ clientId, platform }); // ✅ filter both
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});



module.exports = router;