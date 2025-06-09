// controllers/notificationController.js
const Notification = require('../models/Notification');

exports.getLatestNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })

    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { message, timestamp } = req.body;
    const newNotification = new Notification({ message, timestamp });
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
};

