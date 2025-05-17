const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // adjust if you already have one
const FacebookClient = require('../models/FacebookClientSchema');
const InstagramClient = require('../models/InstagramClientSchema');
const TwitterClient = require('../models/TwitterClientSchema');


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

module.exports = router;