const axios = require('axios');

const igMediaId = '17947816757847404'; // Replace with your Instagram media ID
const accessToken = 'EAAQ66HZCjKZCsBO3iQTKJZAXIwHEbcT0Vd4Q9M14AcxfR8OQfJBfITw7VrEjHaZA8RLIaydC86tp6c0cMAzg82IR9nFhnVPA3K9oYQDudyV5fztNUWkN4j6vYaMNtoyYwCLakEE8mBsiz7m0HaLuwmeCN9eamgdAtIo1f2Sd78HSPud6FmX8vOpD15tHM3ES'; // Replace with a valid Instagram Graph API token

const apiUrl = `https://graph.facebook.com/v19.0/${igMediaId}?fields=like_count,comments_count,comments{text,timestamp}&access_token=${accessToken}`;

async function fetchInstagramPostStats() {
  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    const likeCount = data.like_count || 0;
    const commentCount = data.comments_count || 0;
    const comments = data.comments?.data || [];

    console.log('📸 Instagram Post Stats');
    console.log('------------------------');
    console.log('👍 Likes:', likeCount);
    console.log('💬 Comments:', commentCount);
    console.log('📝 Comment Details:');
    comments.forEach((comment, index) => {
      console.log(` ${index + 1}. ${comment.text}`);
    });
  } catch (error) {
    const status = error?.response?.status || error?.code || 'Unknown';
    const message = error?.response?.data?.error?.message || error?.message || 'No message';
    console.warn(`⚠️ Error fetching Instagram stats: ${status} - ${message}`);
  }
}

fetchInstagramPostStats();
