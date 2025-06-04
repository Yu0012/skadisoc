const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const InstagramClient = require('../models/InstagramClientSchema');

router.get('/', async (req, res) => {
  try {
    const clients = await InstagramClient.find({});

    const formattedClients = clients.map(c => ({
      _id: c._id,
      companyName: c.username,
      companyDetail: `Business ID: ${c.instagramBusinessId || "N/A"}`
    }));

    res.json(formattedClients);
  } catch (error) {
    console.error("Failed to fetch Instagram clients:", error);
    res.status(500).json({ error: "Failed to fetch Instagram clients" });
  }
});

// Dashboard fetch
router.get('/by-client/:id', async (req, res) => {
  try {
    const client = await InstagramClient.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({
      accessToken: client.accessToken,
      instagramBusinessId: client.instagramBusinessId,
      username: client.username
    });
  } catch (error) {
    console.error("Error fetching IG client by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Client editing fetch
router.get('/client/:id', async (req, res) => {
  try {
    const client = await InstagramClient.findById(req.params.id).populate('assignedAdmins');

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({
      _id: client._id,
      accessToken: client.accessToken,
      instagramBusinessId: client.instagramBusinessId,
      username: client.username,
      assignedAdmins: client.assignedAdmins || [],
    });
  } catch (error) {
    console.error("Error fetching IG client by ID:", error);
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

    const updated = await InstagramClient.findByIdAndUpdate(
      clientId,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Client not found" });

    res.json({ message: "Client updated", client: updated });
  } catch (err) {
    console.error("🔥 Instagram PUT error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
