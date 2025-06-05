// local.js
process.env.USE_INTERVALS = 'true';
const { app } = require('./server');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Local server running on http://localhost:${PORT}`);
});