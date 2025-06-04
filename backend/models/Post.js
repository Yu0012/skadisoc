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
  posted: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'scheduled', 'posted'], default: 'draft' },
  platformPostIds: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }); // Add createdAt and updatedAt automatically

// Pre-save hook to handle Malaysia timezone and updatedBy
// postSchema.pre('save', function(next) {
//   const now = new Date();
//   this.updatedAt = toMalaysiaTime(now);
//   if (!this.createdAt) {
//       this.createdAt = toMalaysiaTime(now);
//   }
//   if (this.scheduledDate) {
//       this.scheduledDate = toMalaysiaTime(this.scheduledDate);
//   }
//   // Set updatedBy to the current user if not set
//   if (this.isModified() && !this.isNew && this.$locals.user) {
//     this.updatedBy = this.$locals.user._id;
//   }
//   next();
// });

module.exports = mongoose.model("Post", postSchema);