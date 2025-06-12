require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const qs = require('qs');
const { platform } = require('os');
const mime = require("mime-types");
const axios = require("axios");
const FacebookClient = require('./models/FacebookClientSchema');
const InstagramClient = require('./models/InstagramClientSchema');
const {TwitterApi} = require("twitter-api-v2");
const FormData = require("form-data");
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const session = require('express-session');
const facebookClientsRoute = require('./routes/facebookClients');
const instagramClientsRoute = require('./routes/instagramClients');
const twitterClientsRoute = require('./routes/twitterClients');
const { checkAndPostScheduledPosts } = require('./utils/scheduledPostHandler');
const functions = require('firebase-functions');
const { onSchedule } = require('firebase-functions/v2/scheduler');

const notificationRoutes = require('./routes/notificationRoutes');
const { BASE_URL } = require('./config');
const cloudinary = require('./utils/cloudinary');
const cron = require('node-cron');
const admin = require("firebase-admin");
admin.initializeApp();


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Use built-in JSON parsing
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(passport.initialize()); // Initialize passport

app.use('/api/facebook-clients', facebookClientsRoute);
app.use('/api/instagram-clients', instagramClientsRoute);
app.use('/api/twitter-clients', twitterClientsRoute);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {

})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

// Multer setup for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = "uploads/";
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true }); // Ensure upload directory exists
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });
// const upload = multer({ storage });

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
        redirect_uri: "https://skadisocmed-954f4.web.app/auth/facebook/callback",
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
  callbackURL: `${BASE_URL}/auth/twitter/callback`
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
          refreshToken: req.query.oauth_verifier || "", // Optional
          bearerToken: twitterProfile._json?.access_token || "", // Optional
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

// Step 1: Redirect to LinkedIn OAuth
app.get("/auth/linkedin", (req, res) => {
  const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${BASE_URL}/auth/linkedin/callback&scope=w_member_social&state=random123`;
  res.redirect(linkedInAuthUrl);
});

// LinkedIn OAuth callback
app.get("/auth/linkedin/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("Missing code");

  try {
    const tokenRes = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      qs.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${BASE_URL}/auth/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;
    console.log("LinkedIn Access Token:", accessToken);
    res.send(`Access Token: ${accessToken} \n Now you can store this and schedule posts.`);

  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.status(500).send("OAuth failed");
  }
});

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


exports.scheduledPostHandler = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'Asia/Kuala_Lumpur',
  },
  async (event) => {
    console.log("⏰ Running scheduled task");
    await checkAndPostScheduledPosts();
  }
);


// 🔁 Check Facebook tokens once a day
setInterval(checkAndRefreshTokens, 24 * 60 * 60 * 1000); // Every 24 hours
checkAndRefreshTokens(); // Run immediately on server start

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

const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

const clientRoutes = require('./routes/clientRoutes');
app.use('/api/clients', clientRoutes);

app.use('/api/notifications', notificationRoutes);

app.get('/api/test', (req, res) => res.send('✅ API LIVE'));

app.get('/test', (req, res) => res.send('✅ Test route working'));

// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });


if (process.env.MODE === "local") {
  app.listen(PORT, () => {
    console.log(`✅ Server running locally on http://localhost:${PORT}`);
  });
} else {
  exports.api = functions.https.onRequest(app);
}
