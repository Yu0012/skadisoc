const express = require('express');
const router = express.Router();
const {createNotification, getLatestNotifications, } = require("../controllers/notificationController");

router.post("/", createNotification);
router.get("/latest", getLatestNotifications); 

module.exports = router;

