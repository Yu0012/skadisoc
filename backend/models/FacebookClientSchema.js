const mongoose = require('mongoose');

const FacebookClientSchema = new mongoose.Schema({
  userId: { type: String },
  pageId: { type: String, required: true },
  pageAccessToken: { type: String, required: true },
  pageName: { type: String },
  expiresAt: { type: Date },
  permissions: [String]
});

module.exports = mongoose.model('FacebookClient', FacebookClientSchema);