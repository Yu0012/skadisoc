// const mongoose = require("mongoose");

// // Define Schema
// const postSchema = new mongoose.Schema({
//   content: String,
//   hashtags: String,
//   client: String,
//   scheduledDate: Date,
//   selectedPlatforms: [String],
// });

// // Create Model
// const Post = mongoose.model("Post", postSchema);
// app.post('/api/posts', async (req, res) => {
//   try {
//     const newPost = new Post(req.body);
//     await newPost.save();
//     res.status(201).json({ message: "Post created successfully", post: newPost });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

const mongoose = require('mongoose');

// Create a function to format time to Malaysia timezone
function toMalaysiaTime(date) {
  return new Date(date.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours
}

const postSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  platform: { type: String, enum: ['facebook', 'instagram', 'twitter', 'linkedin'], required: true },
  title: { type: String, required: true },
  content: { type: String },
  media: { type: String }, // store filename or URL
  status: { type: String, enum: ['draft', 'scheduled', 'posted'], default: 'draft' },
  scheduledAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // createdAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Pre-save hook to handle Malaysia timezone
postSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = toMalaysiaTime(now);
  if (!this.createdAt) {
      this.createdAt = toMalaysiaTime(now);
  }
  if (this.scheduledAt) {
      this.scheduledAt = toMalaysiaTime(this.scheduledAt);
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
