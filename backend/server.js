require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));



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
  


// // Define Schema and Model
// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
// });

// const User = mongoose.model('User', userSchema);

// // POST route to save user data
// app.post('/api/users', async (req, res) => {
//   try {
//     const newUser = new User(req.body);
//     await newUser.save();
//     res.status(201).json({ message: "User added successfully", user: newUser });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
