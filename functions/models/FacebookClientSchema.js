const mongoose = require('mongoose');

// Create a function to format time to Malaysia timezone
function toMalaysiaTime(date) {
  return new Date(date.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours
}

const FacebookClientSchema = new mongoose.Schema({
  userId: { type: String },
  pageId: { type: String, required: true },
  pageAccessToken: { type: String, required: true },
  pageName: { type: String },
  expiresAt: { type: Date },
  permissions: [String],
  assignedAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true }); // Add createdAt and updatedAt automatically

// Pre-save hook to handle Malaysia timezone
FacebookClientSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = toMalaysiaTime(now);
  if (!this.createdAt) {
      this.createdAt = toMalaysiaTime(now);
  }
  next();
});

module.exports = mongoose.model('FacebookClient', FacebookClientSchema);