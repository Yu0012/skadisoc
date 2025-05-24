const express = require('express');
const router = express.Router();
const FacebookClient = require('../models/FacebookClientSchema');

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

router.get('/by-client/:clientId', async (req, res) => {
  try {
    const fbClient = await FacebookClient.findOne({ _id: req.params.clientId });
    if (!fbClient) return res.status(404).json({ error: "Client not found" });

    res.json(fbClient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
