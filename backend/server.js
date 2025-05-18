require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { platform } = require('os');
const mime = require("mime-types");
const axios = require("axios");
const FacebookClient = require('./models/FacebookClientSchema');
const InstagramClient = require('./models/InstagramClientSchema');
const TwitterClient = require('./models/TwitterClientSchema');
const Post = require('./models/Post');
const {TwitterApi} = require("twitter-api-v2");
const FormData = require("form-data");
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const session = require('express-session');
const facebookClientsRoute = require('./routes/facebookClients');
const instagramClientsRoute = require('./routes/instagramClients');
const twitterClientsRoute = require('./routes/twitterClients');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Use built-in JSON parsing
app.use(express.static('uploads')); // Serve uploaded files
app.use(passport.initialize()); // Initialize passport

app.use('/api/facebook-clients', facebookClientsRoute);
app.use('/api/instagram-clients', instagramClientsRoute);
app.use('/api/twitter-clients', twitterClientsRoute);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {

})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Ensure upload directory exists
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ===============================
// 📌 **Define Schemas & Models**
// ===============================


// ✅ **Client Schema**
const clientSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyDetail: String,
  socialAccounts: [
    {
      platform: { type: String, required: true }, // Example: "Facebook"
      //Facebook & Instagram
      companyToken: String,
      pageId: String,
      //Twitter
      apiKey: String,
      apiKeySecret: String,
      accessToken: String,
      accessTokenSecret: String,
      //Linkedin
      urn: String
    }
  ]
});

const Client = mongoose.model("Client", clientSchema);

// ✅ **Account Schema**
const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNum: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
}, { timestamps: true });
const Account = mongoose.model("Account", accountSchema);


// ===============================
// 📌 **Client API Routes**
// ===============================

// ✅ Add a new client
app.post('/api/clients', async (req, res) => {
  try {
    const { companyName, companyDetail, socialAccounts } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: "Company name is required" });
    }

    const newClient = new Client({
      companyName,
      companyDetail,
      socialAccounts  // expects array of { platform, companyToken, pageId }
    });

    await newClient.save();
    res.status(201).json({ message: "Client added successfully", client: newClient });

  } catch (error) {
    console.error("Error adding client:", error);
    res.status(500).json({ error: "Failed to add client" });
  }
});

// ✅ Get all clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find();
    
    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// ✅ Edit Client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { companyName, companyDetail, socialAccounts } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: "Company name is required" });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { companyName, companyDetail, socialAccounts },
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.status(200).json({ message: "Client updated successfully", client: updatedClient });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Failed to update client" });
  }
});

// ✅ Delete Client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);

    if (!deletedClient) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Failed to delete client" });
  }
});


// ===============================
// 📌 **Accounts API Routes**
// ===============================

// ✅ Add a new account
app.post('/api/accounts', async (req, res) => {
  try {
    const { name, email, phoneNum, address, password } = req.body;

    if (!name || !email || !phoneNum || !address || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newAccount = new Account({ name, email, phoneNum, address, password });
    await newAccount.save();

    res.status(201).json({ message: "Account created successfully", account: newAccount });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// ✅ Get all accounts
app.get('/api/accounts', async (req, res) => {
  try {
    const accounts = await Account.find();
    res.status(200).json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// UPDATE account
app.put('/api/accounts/:id', async (req, res) => {
  try {
    const updatedAccount = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAccount) return res.status(404).json({ error: "Account not found" });
    res.json({ account: updatedAccount });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ error: "Failed to update account" });
  }
});

// DELETE account
app.delete('/api/accounts/:id', async (req, res) => {
  try {
    const deleted = await Account.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Account not found" });
    res.json({ message: "Account deleted" });
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');  // Instagram needs this
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Function to post to Facebook
const postToFacebook = async (post, client) => {
  try {
    const pageId = client.pageId;
    const pageAccessToken = client.pageAccessToken;

    const url = `https://graph.facebook.com/${pageId}/photos`;

    const formData = new FormData();
    formData.append("access_token", pageAccessToken);
    formData.append("source", fs.createReadStream(path.join(__dirname, post.filePath)));
    formData.append("published", "false"); // 
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

  } catch (error) {
    console.error("Error posting to Facebook:", error.response?.data || error.message);
  }
  return false;
};


async function postToInstagram(post, client) {
  try {
    const igUserId = client.instagramBusinessId;
    const accessToken = client.accessToken;
    
    const mediaUrl = `${"https://d242-58-71-215-67.ngrok-free.app"}${post.filePath}`;

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
    return publishResponse.data.id; // ⬅️ Return post ID

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

    const imagePath = path.join(__dirname, post.filePath);

    if (['.jpg', '.jpeg', '.png'].includes(path.extname(imagePath).toLowerCase())) {
      const mediaData = await twitterClient.v1.uploadMedia(imagePath); // Upload image
      tweetResponse = await twitterClient.v2.tweet(post.content, { media: { media_ids: [mediaData] }}); // Post tweet with image
      console.log(`Post successful on Twitter`);
    }

    else if (['.mp4', '.avi', '.mkv', '.mov', '.gif'].includes(path.extname(imagePath).toLowerCase())) {
      const mediaData = await twitterClient.v1.uploadMedia(imagePath, { type: 'video' }); // Upload video
      tweetResponse = await twitterClient.v2.tweet(post.content, { media: { media_ids: [mediaData] }}); // Post tweet with video
      console.log(`Post successful on Twitter`);
    }
    
    else {
      tweetResponse = await twitterClient.v2.tweet(post.content); // Post tweet without media
    }
    
    const tweetId = tweetResponse?.data?.id;

    if (tweetId) {
      console.log(`Tweet ID: ${tweetId}`);
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
        const client = await FacebookClient.findOne({ pageName: post.client });

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
        const client = await InstagramClient.findOne ({ username: post.client });
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
        const client = await TwitterClient.findOne({ username: post.client });
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

// Step 1: OAuth Login Route
app.get('/auth/facebook', (req, res) => {
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FB_APP_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=pages_show_list,pages_manage_posts,instagram_basic,instagram_content_publish&response_type=code`;
  res.redirect(authUrl);
});

app.get('/auth/facebook/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Step 2: Exchange code for access token
    const tokenResponse = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
      params: {
        client_id: process.env.FB_APP_ID,
        redirect_uri: process.env.REDIRECT_URI,
        client_secret: process.env.FB_APP_SECRET,
        code,
      },
    });

    const shortLivedToken = tokenResponse.data.access_token;
    console.log("Access Token:", shortLivedToken);

    // Exchange short-lived for long-lived token
    const longLivedResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        fb_exchange_token: shortLivedToken,
      },
    });

    const longLivedAccessToken = longLivedResponse.data.access_token;
    const expiresIn = longLivedResponse.data.expires_in || 60 * 24 * 60 * 60;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Step 3: Use the access token to fetch user details
    // Get list of pages
    const pagesResponse = await axios.get(`https://graph.facebook.com/v18.0/me/accounts`, {
      params: { access_token: longLivedAccessToken },
    });
    console.log("Pages:", pagesResponse.data);

    const page = pagesResponse.data.data[0]; // Assuming the first page
    if (!page) return res.status(400).json({ message: 'No page found' });

    // Get Instagram Business ID
    const igResponse = await axios.get(`https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account`, {
      params: { access_token: page.access_token },
    });

    const instagramBusinessId = igResponse.data.instagram_business_account?.id || '';

    const userResponse = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${longLivedAccessToken}`);
    console.log("User Details:", userResponse.data);
    const userId = userResponse.data.id; // ✅ Add this line

    // Save Facebook pages
    for (const page of pagesResponse.data.data) {

      // Save Facebook client
      await FacebookClient.findOneAndUpdate(
        { userId, pageId: page.id },
        {
          userId,
          pageId: page.id,
          pageAccessToken: page.access_token,
          pageName: page.name,
          permissions: [],
          expiresAt,
        },
        { upsert: true, new: true }
      );

      // Step 6: Get Instagram Business Account (if any)
      const igResponse = await axios.get(`https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account`, {
        params: { access_token: page.access_token },
      });

      const instagramBusinessId = igResponse.data.instagram_business_account?.id;
      if (instagramBusinessId) {
        await InstagramClient.findOneAndUpdate(
          { userId, instagramBusinessId },
          {
            userId,
            instagramBusinessId,
            username: page.name,
            accessToken: page.access_token,
            permissions: [],
            expiresAt,
          },
          { upsert: true, new: true }
        );
      }
    }

    // ✅ Only one response here
    return res.json({
      message: 'Facebook pages saved successfully.',
      pageId: page.id,
      instagramBusinessId
    });
  } 
  
  catch (error) {
    console.error("Error during Facebook OAuth:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to authenticate with Facebook" });
  }
});


// Express session
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Serialize user
passport.serializeUser((user, done) => {done(null, user);});
passport.deserializeUser((obj, done) => {done(null, obj);});

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "http://localhost:5000/auth/twitter/callback"
},
function(token, tokenSecret, profile, done) {
  // Save tokens to DB for future requests
  // console.log('Twitter Profile:', profile);
  console.log('Access Token:', token);
  console.log('Token Secret:', tokenSecret);
  profile.accessToken = token;
  profile.tokenSecret = tokenSecret;  
  return done(null, profile);
}));

// Step 1: Start the login process
app.get('/auth/twitter', passport.authenticate('twitter'));

// Step 2: Handle the callback
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  async function (req, res) {
    try {
      const twitterProfile = req.user; // From passport

      await TwitterClient.findOneAndUpdate(
        { userId: twitterProfile.id },
        {
          userId: twitterProfile.id,
          username: twitterProfile.username,
          name: twitterProfile.displayName,
          appKey: process.env.TWITTER_CONSUMER_KEY,
          appSecret: process.env.TWITTER_CONSUMER_SECRET,
          accessToken: twitterProfile.accessToken || "",  // Optional
          accessTokenSecret: twitterProfile.tokenSecret || "", // Optional
          refreshToken: req.query.oauth_verifier || "" // Optional
        },
        { upsert: true, new: true }
      );

      res.json({
        message: "✅ Twitter client saved",
        user: {
          id: twitterProfile.id,
          username: twitterProfile.username,
          name: twitterProfile.displayName
        }
      });

    } catch (err) {
      console.error("❌ Failed to save Twitter client:", err);
      res.status(500).json({ error: "Failed to save Twitter client" });
    }
  }
);

const refreshFacebookToken = async (client) => {
  try {
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        fb_exchange_token: client.pageAccessToken,
      },
    });

    const newAccessToken = response.data.access_token;
    const expiresIn = response.data.expires_in || 60 * 24 * 60 * 60; // 60 days
    const newExpiresAt = new Date(Date.now() + expiresIn * 1000);

    await FacebookClient.findByIdAndUpdate(client._id, {
      pageAccessToken: newAccessToken,
      expiresAt: newExpiresAt
    });

    console.log(`🔄 Refreshed token for page "${client.pageName}"`);
  } catch (error) {
    console.error(`❌ Failed to refresh token for "${client.pageName}":`, error.response?.data || error.message);
  }
};

const checkAndRefreshTokens = async () => {
  const now = new Date();
  const threshold = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

  try {
    const expiringTokens = await FacebookClient.find({ expiresAt: { $lte: threshold } });

    for (const client of expiringTokens) {
      await refreshFacebookToken(client);
    }
  } catch (err) {
    console.error("❌ Error while checking/refreshing tokens:", err.message);
  }
};

// 🔁 Check Facebook tokens once a day
setInterval(checkAndRefreshTokens, 24 * 60 * 60 * 1000); // Every 24 hours
checkAndRefreshTokens(); // Run immediately on server start

// Run the function every minute
setInterval(checkAndPostScheduledPosts, 60 * 1000);
checkAndPostScheduledPosts(); // Run immediately on server start

// Test routes
app.get('/test', (req, res) => {
  res.send('✅ Test route works!');
});

app.get('/', (req, res) => {
  res.send('🚀 Welcome to the API root');
});

// ===============================
// 📌 **Start Server**
// ===============================


// ✅ Initialize Passport and use JWT strategy
require('./config/passport')(passport); // ← Load passport config
app.use(passport.initialize());         // ← Initialize passport

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/test', (req, res) => res.send('✅ Test route working'));


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
