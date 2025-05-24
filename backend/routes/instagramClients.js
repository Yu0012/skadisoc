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



module.exports = router;
