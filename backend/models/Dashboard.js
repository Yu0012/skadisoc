const axios = require('axios'); // If using Node >=18, you can use native fetch
const postId = '537263709478406_122125283666782804';
const accessToken = 'EAAQ66HZCjKZCsBO2D8V67xcGZAt0C0SanTLZBxF6qlM4UozSsFmncd8QrBFxPSOqbBqtZBasyBWZCDqdnG2g3ZADmAbnb9MNXuIGP9rQaPOAuoqHlYFQcEgVFhdkIPE8EVAtZAOZBRZBQwOZAB4rH3ixZCq6qrHhLKbKDEnZAyX4srShFplyH5TVnqclnJOIuZAvRKhgWa';

const apiUrl = `https://graph.facebook.com/v22.0/${postId}?fields=likes.summary(true),shares,comments.summary(true)&access_token=${accessToken}`;
const commentsUrl = `https://graph.facebook.com/v22.0/${postId}/comments?summary=true&access_token=${accessToken}`;

async function fetchPostStats() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const likes = data.likes?.summary?.total_count || 0;
    const shares = data.shares?.count || 0;
    const comments = data.comments?.summary?.total_count || 0;

    console.log('📊 Facebook Post Stats');
    console.log('-----------------------');
    console.log('👍 Likes:', likes);
    console.log('🔁 Shares:', shares);
    console.log('💬 Comments:', comments);
  } catch (error) {
    console.error('❌ Error fetching post stats:', error.message);
  }
}

const fetchComments = async () => {
    try {
      const response = await axios.get(`https://graph.facebook.com/v22.0/${postId}/comments?summary=true&access_token=${accessToken}`);
      const comments = response.data.summary?.total_count || 0;
      console.log(`💬 Comments: ${comments}`);
    } catch (error) {
      const status = error?.response?.status || error?.code || 'Unknown';
      const message = error?.response?.data?.error?.message || error?.message || 'No error message';
      console.warn(`⚠️ Error fetching comments: ${status} - ${message}`);
    }
  };
  
fetchPostStats();
