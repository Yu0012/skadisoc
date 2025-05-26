const mongoose = require('mongoose');

const InstagramClientSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  instagramBusinessId: { type: String, required: true }, 
  accessToken: { type: String, required: true },
  username: { type: String },
  accountType: { type: String }, // e.g., BUSINESS or CREATOR
  expiresAt: { type: Date },
  permissions: [String],
  assignedAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('InstagramClient', InstagramClientSchema);