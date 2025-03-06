const mongoose = require("mongoose");

// Define Schema
const postSchema = new mongoose.Schema({
  content: String,
  hashtags: String,
  client: String,
  scheduledDate: Date,
  selectedPlatforms: [String],
});

// Create Model
const Post = mongoose.model("Post", postSchema);
app.post('/api/posts', async (req, res) => {
  try {
    const newPost = new Post(req.body);
    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
