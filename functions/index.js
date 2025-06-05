const functions = require('firebase-functions');
const { app, checkAndRefreshTokens, checkAndPostScheduledPosts } = require('../server');

// ===============================
// 🌐 HTTP Function for API
// ===============================
exports.api = functions.https.onRequest(app);

// ===============================
// ⏰ Scheduled Functions
// ===============================
exports.refreshFacebookTokens = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  await checkAndRefreshTokens();
  return null;
});

exports.checkScheduledPosts = functions.pubsub.schedule('every 1 minutes').onRun(async () => {
  await checkAndPostScheduledPosts();
  return null;
});