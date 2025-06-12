const express = require('express');
const router = express.Router();
const {createNotification, getLatestNotifications, } = require("../controllers/notificationController");

router.post("/", createNotification);
router.get("/latest", getLatestNotifications); // ✅ this route

module.exports = router;

