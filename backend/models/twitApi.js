const axios = require('axios');

const tweetId = '1925523599651479862'; // e.g., 1645348701728940032
const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAEZS0AEAAAAAXP%2B5lmszjN0L4dQJ1Gs6PgP4Uhs%3Daxs6HBrTs0plh4QlVostOymp1jEHGDGcCDaTSLdK8MUrbWXHZ'; // Paste your real token here

const tweetStatsUrl = `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`;
const repliesUrl = `https://api.twitter.com/2/tweets/search/recent?query=conversation_id:${tweetId}&tweet.fields=author_id,text`;

const headers = {
  Authorization: `Bearer ${bearerToken}`,
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchTweetStats() {
  try {
    const response = await axios.get(tweetStatsUrl, { headers });
    const data = response.data.data;
    const metrics = data.public_metrics;

    console.log(`📊 Tweet Stats for ID: ${tweetId}`);
    console.log(`👍 Likes: ${metrics.like_count}`);
    console.log(`🔁 Retweets: ${metrics.retweet_count}`);
    console.log(`💬 Replies (count): ${metrics.reply_count}`);
    console.log(`🧵 Quotes: ${metrics.quote_count}`);

    const remaining = response.headers['x-rate-limit-remaining'];
    const resetTime = response.headers['x-rate-limit-reset'];
    console.log(`⏳ Requests remaining: ${remaining} | Reset at: ${new Date(resetTime * 1000)}`);
  } catch (error) {
    console.error('❌ Error fetching tweet stats:', error.response?.data || error.message);
  }
}

async function fetchReplies() {
  try {
    const response = await axios.get(repliesUrl, { headers });
    const replies = response.data.data || [];

    console.log(`\n📝 Recent Replies (${replies.length}):`);
    replies.forEach((reply, index) => {
      console.log(`${index + 1}. @${reply.author_id}: ${reply.text}`);
    });

    const remaining = response.headers['x-rate-limit-remaining'];
    const resetTime = response.headers['x-rate-limit-reset'];
    console.log(`⏳ Requests remaining: ${remaining} | Reset at: ${new Date(resetTime * 1000)}`);
  } catch (error) {
    console.warn('⚠️ Error fetching replies:', error.response?.data || error.message);
  }
}

async function main() {
  await fetchTweetStats();
  await delay(2000); // 🔁 Add delay between requests (2 seconds)
  await fetchReplies();
}

main();
