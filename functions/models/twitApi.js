const axios = require('axios');

const tweetId = '1925523599651479862'; // e.g., 1645348701728940032
const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAEZS0AEAAAAAxcxLrFdG%2BzY%2FAFpFw9WHULpwgDY%3DUc4Jt1xUsJWAlQ9NSTqHppERWxsyIjOcVY8tv7VBWQt9f1hK9A'; // Paste your real token here

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

// Wrap fetch functions with retry on 429 errors
async function safeFetchTweetStats(tweetId) {
  try {
    await fetchTweetStats(tweetId);
  } catch (error) {
    if (error.response?.status === 429) {
      const resetTime = error.response.headers['x-rate-limit-reset'];
      const waitTime = resetTime * 1000 - Date.now();
      console.warn(`⚠️ Rate limited. Retrying in ${Math.ceil(waitTime / 1000)} seconds...`);
      await delay(waitTime);
      return safeFetchTweetStats(tweetId);
    } else {
      console.error("❌ Error fetching tweet stats:", error.response?.data || error.message);
    }
  }
}

async function safeFetchReplies(tweetId) {
  try {
    await fetchReplies(tweetId);
  } catch (error) {
    if (error.response?.status === 429) {
      const resetTime = error.response.headers['x-rate-limit-reset'];
      const waitTime = resetTime * 1000 - Date.now();
      console.warn(`⚠️ Rate limited. Retrying in ${Math.ceil(waitTime / 1000)} seconds...`);
      await delay(waitTime);
      return safeFetchReplies(tweetId);
    } else {
      console.error("❌ Error fetching replies:", error.response?.data || error.message);
    }
  }
}

async function main() {
  await fetchTweetStats();
  await delay(2000); // 🔁 Add delay between requests (2 seconds)
  await fetchReplies();
  // await safeFetchTweetStats(tweetId);
  // await safeFetchReplies(tweetId);
}

main();
