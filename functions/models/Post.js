const mongoose = require("mongoose");

// Create a function to format time to Malaysia timezone
function toMalaysiaTime(date) {
  return new Date(date.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours
}

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  title: String,
  client: String,
  clientName: String,
  scheduledDate: Date,
  selectedPlatforms: [String],
  filePath: String, // Store file path if uploaded
  posted: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'scheduled', 'posted', "failed"], default: 'draft' },
  platformPostIds: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }); // Add createdAt and updatedAt automatically



module.exports = mongoose.model("Post", postSchema);