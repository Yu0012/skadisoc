const isLocal = process.env.MODE === 'local';

const config = {
  API_BASE: isLocal
    ? 'http://localhost:5000'
    : 'https://us-central1-skadisocmed-954f4.cloudfunctions.net/api'
};

module.exports = config;
