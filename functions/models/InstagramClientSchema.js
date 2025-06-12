const mongoose = require('mongoose');

// Create a function to format time to Malaysia timezone
function toMalaysiaTime(date) {
  return new Date(date.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours
}

const InstagramClientSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  instagramBusinessId: { type: String, required: true }, 
  accessToken: { type: String, required: true },
  username: { type: String },
  // createdAt: { type: Date, default: () => getMalaysiaTime() },
  // updatedAt: { type: Date, default: () => getMalaysiaTime() },
  accountType: { type: String }, // e.g., BUSINESS or CREATOR
  expiresAt: { type: Date },
  permissions: [String],
  assignedAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true }); // Add createdAt and updatedAt automatically

// Pre-save hook to handle Malaysia timezone
InstagramClientSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = toMalaysiaTime(now);
  if (!this.createdAt) {
      this.createdAt = toMalaysiaTime(now);
  }
  next();
});

module.exports = mongoose.model('InstagramClient', InstagramClientSchema);