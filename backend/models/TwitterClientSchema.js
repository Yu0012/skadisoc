const mongoose = require('mongoose');

const TwitterClientSchema = new mongoose.Schema({
  userId: { type: String, required: true },           // Twitter user ID
  username: { type: String, required: true },         // @username
  name: { type: String },                             // Display name
  accessToken: { type: String, required: true },
  refreshToken: { type: String },                     // Optional
  expiresAt: { type: Date },                          // Optional
});

module.exports = mongoose.model('TwitterClient', TwitterClientSchema);
