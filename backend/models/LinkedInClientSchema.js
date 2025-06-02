const mongoose = require('mongoose');

// Create a function to format time to Malaysia timezone
function toMalaysiaTime(date) {
  return new Date(date.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours
}

const LinkedInClientSchema = new mongoose.Schema({
  userId: { type: String, required: true },           // Twitter user ID
  username: { type: String, required: true },         // @username
  name: { type: String },  
  // createdAt: { type: Date, default: () => getMalaysiaTime() },
  // updatedAt: { type: Date, default: () => getMalaysiaTime() },
  appKey: { type: String, required: true },
  appSecret: { type: String, required: true },                           // Display name
  accessToken: { type: String, required: true },
  accessTokenSecret: { type: String, required: true }, // Access token secret
  refreshToken: { type: String },                     // Optional
  expiresAt: { type: Date },                          // Optional
  bearerToken: { type: String, required: true }, // Bearer token for API access
  assignedAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true }); // Add createdAt and updatedAt automatically

// Pre-save hook to handle Malaysia timezone
LinkedInClientSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = toMalaysiaTime(now);
  if (!this.createdAt) {
      this.createdAt = toMalaysiaTime(now);
  }
  next();
});

module.exports = mongoose.model('LinkedInClient', LinkedInClientSchema);
