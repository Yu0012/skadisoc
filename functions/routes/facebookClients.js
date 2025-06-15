const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const FacebookClient = require('../models/FacebookClientSchema');

router.post('/', async (req, res) => {
  try {
    const newClient = new FacebookClient({
      pageName: req.body.pageName,
      pageId: req.body.pageId,
      pageAccessToken: req.body.companyToken,
      assignedAdmins: req.body.assignedAdmins || []
    });

    await newClient.save();
    res.json({ message: "Client created", client: newClient });
  } catch (err) {
    console.error("Error creating Facebook client:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const clients = await FacebookClient.find({});
    const formatted = clients.map(c => ({
      _id: c._id,
      companyName: c.pageName,
      companyDetail: `Page ID: ${c.pageId}`,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Facebook clients' });
  }
});

router.get("/with-posts", async (req, res) => {
  try {
    const clients = await FacebookClient.find({ 'posts.0': { $exists: true } });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clients with posts" });
  }
});

// Dashboard fetch
router.get('/by-client/:clientId', async (req, res) => {
  try {
    const fbClient = await FacebookClient.findOne({ _id: req.params.clientId });
    if (!fbClient) return res.status(404).json({ error: "Client not found" });

    res.json(fbClient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Client editing fetch
router.get('/client/:clientId', async (req, res) => {
  try {
    const fbClient = await FacebookClient.findOne({ _id: req.params.clientId });
    if (!fbClient) return res.status(404).json({ error: "Client not found" });

    res.json(fbClient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit client
router.put('/:id', async (req, res) => {
  try {
    const clientId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: "Invalid client ID format" });
    }

    console.log("🔥 Incoming PUT payload:", req.body);

    const updated = await FacebookClient.findByIdAndUpdate(
      clientId,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({ message: "Client updated", client: updated });
  } catch (err) {
    console.error("🔥 PUT error:", err);
    res.status(500).json({ error: err.message || "Update failed" });
  }
});
module.exports = router;
