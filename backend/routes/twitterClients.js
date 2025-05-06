const express = require('express');
const router = express.Router();
const TwitterClient = require('../models/TwitterClientSchema');

router.get('/', async (req, res) => {
  try {
    const clients = await TwitterClient.find({});
    const formatted = clients.map(c => ({
      _id: c._id,
      companyName: c.username,
      companyDetail: `Twitter user: ${c.name || c.username}`,
    }));
    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching Twitter clients:", err);
    res.status(500).json({ error: "Failed to fetch Twitter clients" });
  }
});

module.exports = router;
