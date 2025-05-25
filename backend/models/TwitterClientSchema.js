const mongoose = require('mongoose');

const TwitterClientSchema = new mongoose.Schema({
  userId: { type: String, required: true },           // Twitter user ID
  username: { type: String, required: true },         // @username
  name: { type: String },  
  appKey: { type: String, required: true },
  appSecret: { type: String, required: true },                           // Display name
  accessToken: { type: String, required: true },
  accessTokenSecret: { type: String, required: true }, // Access token secret
  refreshToken: { type: String },                     // Optional
  expiresAt: { type: Date },                          // Optional
  bearerToken: { type: String, required: true }, // Bearer token for API access
  //assignedAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('TwitterClient', TwitterClientSchema);
