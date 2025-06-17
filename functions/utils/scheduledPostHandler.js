const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');
const FormData = require('form-data');
const Post = require('../models/Post');
const FacebookClient = require('../models/FacebookClientSchema');
const InstagramClient = require('../models/InstagramClientSchema');
const TwitterClient = require('../models/TwitterClientSchema');

// Function to post to Facebook
const postToFacebook = async (post, client) => {
  try {
    const pageId = client.pageId;
    const pageAccessToken = client.pageAccessToken;

    const hasFile = !!post.filePath;
    let imagePath = null;

    if (hasFile) {
      imagePath = path.join(__dirname, '..', post.filePath);
    }

    if (hasFile && ['.jpg', '.jpeg', '.png'].includes(path.extname(imagePath).toLowerCase())) {
      const url = `https://graph.facebook.com/${pageId}/photos`;
      const formData = new FormData();
      formData.append("access_token", pageAccessToken);
      // formData.append("source", fs.createReadStream(path.join(__dirname, '..', post.filePath))); //Use this line if you want to upload from local file system
      formData.append("url", post.filePath); // Use this line if you want to upload from a URL
      formData.append("published", "false");

      const response = await axios.post(url, formData, {
        headers: formData.getHeaders(),
      });

      const mediaId = response.data.id;

      // Publish the post via feed
      const publishUrl = `https://graph.facebook.com/${pageId}/feed`;
      const publishResponse = await axios.post(publishUrl, {
        message: post.content,
        attached_media: JSON.stringify([{ media_fbid: mediaId }]),
        access_token: pageAccessToken,
      });

      if (publishResponse.data.id) {
        console.log('✅ Facebook Post ID:', publishResponse.data.id);
        return publishResponse.data.id; // ⬅️ Return post ID
      }
    }

    else if (hasFile && ['.mp4', '.avi', '.mkv', '.mov', '.gif'].includes(path.extname(imagePath).toLowerCase())) {
      const url = `https://graph.facebook.com/${pageId}/videos`;
      const formData = new FormData();
      formData.append("access_token", pageAccessToken);
      formData.append("file_url", post.filePath); // Use this line if you want to upload from a URL
      // formData.append("source", fs.createReadStream(path.join(__dirname, '..', post.filePath))); // Use this line if you want to upload from local file system
      formData.append("description", post.content);
      formData.append("published", "false");
      formData.append("title", post.content);

      const response = await axios.post(url, formData, {
        headers: formData.getHeaders(),
      });
      const mediaId = response.data.id;
      console.log('✅ Facebook Video ID:', mediaId);
      // Publish the video via feed
      const publishUrl = `https://graph.facebook.com/${pageId}/feed`;
      const publishResponse = await axios.post(publishUrl, {
        message: post.content,
        attached_media: JSON.stringify([{ media_fbid: mediaId }]),
        access_token: pageAccessToken,
      });
      if (publishResponse.data.id) {
        console.log('✅ Facebook Video Post ID:', publishResponse.data.id);
        return publishResponse.data.id; // ⬅️ Return post ID
      }
    }

    // 📝 If no valid image, just post text
    const publishUrl = `https://graph.facebook.com/${pageId}/feed`;
    const publishResponse = await axios.post(publishUrl, {
      message: post.content,
      access_token: pageAccessToken,
    });

    if (publishResponse.data.id) {
      console.log('✅ Facebook post without image:', publishResponse.data.id);
      return publishResponse.data.id;
    }
  } 
  catch (error) {
    console.error("Error posting to Facebook:", error.response?.data || error.message);
    return false;
  }
};

async function postToInstagram(post, client) {
  try {
    const igUserId = client.instagramBusinessId;
    const accessToken = client.accessToken;

    const mediaUrl = post.filePath;
    console.log("📷 Media URL for Instagram:", mediaUrl);
    
    if (!mediaUrl) {
      console.error("❌ No valid image URL for Instagram post.");
      return;
    }

    const message = `${post.content}`;

    // Step 1: Upload Media
    const mediaResponse = await axios.post(
      `https://graph.facebook.com/${igUserId}/media`,
      {
        image_url: mediaUrl,
        caption: message,
        access_token: accessToken,
      }
    );

    const creationId = mediaResponse.data.id;

    // Step 2: Publish Media
    const publishResponse = await axios.post(
      `https://graph.facebook.com/${igUserId}/media_publish`,
      {
        creation_id: creationId,
        access_token: accessToken,
      }
    );

    console.log('✅ Instagram Post ID:', publishResponse.data.id);
    return publishResponse.data.id;

  } catch (error) {
    console.error('Error posting to Instagram:', error.response?.data || error.message);
    return false;
  }
}


const postToTwitter = async (post, client) => { 
  try {
    const {
      appKey,
      appSecret,
      accessToken,
      accessTokenSecret,
      username,
    } = client;

    if (!appKey || !appSecret || !accessToken || !accessTokenSecret) {
      console.error(`❌ Missing Twitter credentials for client: ${username}`);
      return false;
    }

    const twitterClient = new TwitterApi({
      appKey: appKey,
      appSecret: appSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });
    
    const hasFile = !!post.filePath;
    let imagePath = null;

    if (hasFile) {
      const downloadMediaFromUrl = async (url, ext) => {
        const tempPath = path.join(__dirname, '..', `${post._id}${ext}`);
        const writer = fs.createWriteStream(tempPath);
        const response = await axios({ url, method: 'GET', responseType: 'stream' });
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        return tempPath;
      };

      if (post.filePath.includes('cloudinary')) {
          const ext = post.filePath.includes('.mp4') ? '.mp4' : '.jpg';
          imagePath = await downloadMediaFromUrl(post.filePath, ext);
      } else {
        const tempImagePath = path.join(__dirname, '..', `${post._id}.jpg`);
        await downloadImageFromUrl(post.filePath, tempImagePath);
        imagePath = tempImagePath;
      }
    }

    if (hasFile && ['.jpg', '.jpeg', '.png'].includes(path.extname(imagePath).toLowerCase())) {
      const mediaData = await twitterClient.v1.uploadMedia(imagePath); // Upload image
      tweetResponse = await twitterClient.v2.tweet(post.content, { media: { media_ids: [mediaData] }}); // Post tweet with image
      console.log(`Post successful on Twitter`);
    }


    else if (hasFile && ['.mp4'].includes(path.extname(imagePath).toLowerCase())) {
      // Step 2: Check MIME type using HEAD request
      const headResponse = await axios.head(post.filePath);
      const contentType = headResponse.headers['content-type'];

      if (!contentType.includes('video/mp4')) {
        console.error('❌ Twitter only supports video/mp4 — this file is not supported:', contentType);
        return false;
      }

      // Upload video to Twitter
      const mediaData = await twitterClient.v1.uploadMedia(imagePath, {
        mimeType: 'video/mp4',
        target: 'tweet',
      });

      tweetResponse = await twitterClient.v2.tweet(post.content, {
        media: { media_ids: [mediaData] },
      });
    }


    else if (hasFile) {
      console.error("❌ Unsupported media type for Twitter video upload.");
      return false;
    }

    
    else {
      tweetResponse = await twitterClient.v2.tweet(post.content); // Post tweet without media
    }
    
    const tweetId = tweetResponse?.data?.id;

    if (tweetId) {
      console.log(`Tweet ID: ${tweetId}`);
      // 🧹 Clean up downloaded image file
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Failed to delete temp image:", err);
        else console.log("🧹 Temp image deleted:", imagePath);
      });
      return tweetId; // ⬅️ Return tweet ID
    }

    return true;
  } catch (error) {
    console.error("Error posting to Twitter:", error.response?.data || error.message);
  }
  return false;
}

const checkAndPostScheduledPosts = async () => {
  try {
    const now = new Date();
    const posts = await Post.find({ scheduledDate: { $lte: now }, posted: false });

    for (const post of posts) {
      const platforms = post.selectedPlatforms;

      if (platforms.includes("facebook")) 
      {
        const client = await FacebookClient.findOne({ pageName: post.clientName });

        if (!client) 
          {
            console.error(`Facebook client not found for post: ${post._id}`);
            continue;
          }

        const fbPostId = await postToFacebook(post, client);
        if (fbPostId) 
        {
          post.platformPostIds.facebook = fbPostId;
        }
      }

      else if (platforms.includes("instagram"))
      {
        const client = await InstagramClient.findOne ({ username: post.clientName });
        if (!client) 
        {
          console.error(`Instagram client not found for post: ${post._id}`);
          continue;
        }

        const igPostId = await postToInstagram(post, client);
        if (igPostId) 
        {
          post.platformPostIds.instagram = igPostId;
        }
      }

      else if (platforms.includes("twitter"))
      {
        const client = await TwitterClient.findOne({ username: post.clientName });
        if (!client) 
        {
          console.error(`Twitter client not found for post: ${post._id}`);
          continue;
        }

        const tweetId = await postToTwitter(post, client);
        if (tweetId) 
        {
          post.platformPostIds.twitter = tweetId;
        }
      }

      if (Object.values(post.platformPostIds).some((id) => id)) 
      {
        post.posted = true;
        post.status = 'posted';
        await post.save();
      }
    } 
  } catch (error) {
    console.error("Error checking scheduled posts:", error);
  }
};

module.exports = {
  checkAndPostScheduledPosts,
  postToFacebook,
  postToInstagram,
  postToTwitter
};