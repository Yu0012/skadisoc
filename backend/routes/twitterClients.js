const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
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

// Fetch edit
router.get('/client/:id', async (req, res) => {
  try {
    const client = await TwitterClient.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({
      _id: client._id,
      username: client.username,
      name: client.name,
      assignedAdmins: client.assignedAdmins || [],
    });
  } catch (err) {
    console.error("🔥 Error fetching Twitter client:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Edit client
router.put('/:id', async (req, res) => {
  try {
    const clientId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Optional: sanitize assignedAdmins
    if (Array.isArray(req.body.assignedAdmins)) {
      req.body.assignedAdmins = req.body.assignedAdmins.map(id => new mongoose.Types.ObjectId(id));
    }

    const updated = await TwitterClient.findByIdAndUpdate(
      clientId,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Client not found" });

    res.json({ message: "Client updated", client: updated });
  } catch (err) {
    console.error("🔥 PUT error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
