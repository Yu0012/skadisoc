const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  title: String,
  client: String,
  scheduledDate: Date,
  selectedPlatforms: [String],
  filePath: String, // Store file path if uploaded
  posted: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'scheduled', 'posted'], default: 'draft' },
  platformPostIds: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
});

module.exports = mongoose.model("Post", postSchema);
