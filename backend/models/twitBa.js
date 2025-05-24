const axios = require('axios');
const qs = require('qs');

const apiKey = 'woU7hCzIYGkXjvFdwIK0KDwyr';
const apiSecret = '8OGqBYSimCOdeY7OrgVmhmzzxWVYFh37U5R1HD2K8D2UZ1kIzm';

const getBearerToken = async () => {
  const encodedKey = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  try {
    const response = await axios.post(
      'https://api.twitter.com/oauth2/token',
      qs.stringify({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: `Basic ${encodedKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('✅ Bearer Token:', response.data.access_token);
    return response.data.access_token;
  } catch (err) {
    console.error('❌ Error getting bearer token:', err.response?.data || err.message);
  }
};

getBearerToken();
