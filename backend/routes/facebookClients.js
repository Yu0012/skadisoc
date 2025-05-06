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

module.exports = router;
