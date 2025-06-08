const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: String,
  message: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
