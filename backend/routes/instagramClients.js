const express = require('express');
const router = express.Router();
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


module.exports = router;
