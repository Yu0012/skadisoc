const mongoose = require("mongoose");

// Create a function to format time to Malaysia timezone
function toMalaysiaTime(date) {
  return new Date(date.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours
}

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  title: String,
  client: String,
  scheduledDate: Date,
  selectedPlatforms: [String],
  filePath: String, // Store file path if uploaded
  // createdAt: { type: Date, default: () => getMalaysiaTime() },
  // updatedAt: { type: Date, default: () => getMalaysiaTime() },
  posted: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'scheduled', 'posted'], default: 'draft' },
  platformPostIds: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
}, { timestamps: true }); // Add createdAt and updatedAt automatically

// Pre-save hook to handle Malaysia timezone
postSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = toMalaysiaTime(now);
  if (!this.createdAt) {
      this.createdAt = toMalaysiaTime(now);
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
