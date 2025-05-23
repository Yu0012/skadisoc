const express = require('express');
const router = express.Router();
const { getAIResponse } = require('../models/ai');

router.post('/', async (req, res) => {
  const { message } = req.body;

  try {
    const reply = await getAIResponse(message);
    res.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
