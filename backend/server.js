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
const {TwitterApi} = require("twitter-api-v2");
const FormData = require("form-data");
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const session = require('express-session');
const facebookClientsRoute = require('./routes/facebookClients');
const instagramClientsRoute = require('./routes/instagramClients');
const twitterClientsRoute = require('./routes/twitterClients');

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

// // ===============================
// // 📌 **Define Schemas & Models**
// // ===============================

// // ✅ **Post Schema**
// const postSchema = new mongoose.Schema({
//   content: { type: String, required: true },
//   title: String,
//   client: String,
//   scheduledDate: Date,
//   selectedPlatforms: [String],
//   filePath: String, // Store file path if uploaded
//   posted: { type: Boolean, default: false },
//   status: { type: String, enum: ['draft', 'scheduled', 'posted'], default: 'draft' },
//   platformPostIds: {
//     facebook: String,
//     instagram: String,
//     twitter: String,
//     linkedin: String
//   },
// });
// const Post = mongoose.model("Post", postSchema);

// // ✅ **Client Schema**
// const clientSchema = new mongoose.Schema({
//   companyName: { type: String, required: true },
//   companyDetail: String,
//   socialAccounts: [
//     {
//       platform: { type: String, required: true }, // Example: "Facebook"
//       //Facebook & Instagram
//       companyToken: String,
//       pageId: String,
//       //Twitter
//       apiKey: String,
//       apiKeySecret: String,
//       accessToken: String,
//       accessTokenSecret: String,
//       //Linkedin
//       urn: String
//     }
//   ]
// });

// const Client = mongoose.model("Client", clientSchema);

// // ✅ **Account Schema**
// const accountSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phoneNum: { type: String, required: true },
//   address: { type: String, required: true },
//   password: { type: String, required: true },
// }, { timestamps: true });
// const Account = mongoose.model("Account", accountSchema);

// // ===============================
// // 📌 **Post API Routes**
// // ===============================

// // ✅ Create a new post (with optional file upload)
// app.post('/api/posts', upload.single('file'), async (req, res) => {
//   try {
//     const { title, content, client, scheduledDate } = req.body;

//     let selectedPlatforms = [];
//     if (req.body.selectedPlatforms) {
//       try {
//         selectedPlatforms = JSON.parse(req.body.selectedPlatforms);
//       } catch (error) {
//         console.error("Error parsing selectedPlatforms:", error);
//       }
//     }

//     if (!content) {
//       return res.status(400).json({ error: "Content is required" });
//     }

//     const parsedDate = scheduledDate ? new Date(scheduledDate) : null;

//     let status = 'draft';
//     if (parsedDate) status = 'scheduled';

//     const newPost = new Post({
//       title,
//       content,
//       client,
//       scheduledDate: parsedDate,
//       selectedPlatforms,
//       filePath: req.file ? `/uploads/${req.file.filename}` : null,
//       posted: false,
//       status
//     });


//     await newPost.save();
//     res.status(201).json({ message: "Post created successfully", post: newPost });
//   } catch (error) {
//     console.error("Error creating post:", error);
//     res.status(500).json({ error: "Failed to create post" });
//   }
// });

// // ✅ Get all posts
// app.get('/api/posts', async (req, res) => {
//   try {
//     const { clientId } = req.query;
//     let filter = {};

//     if (clientId) {
//       // 🔁 Find client by ID first, then use companyName to match posts
//       const client = await Client.findById(clientId);
//       if (client) {
//         filter.client = client.companyName;
//       }
//     }

//     const posts = await Post.find(filter);
//     res.status(200).json(posts);
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     res.status(500).json({ error: "Failed to fetch posts" });
//   }
// });


// app.get('/api/scheduled-posts', async (req, res) => {
//   try {
//     const now = new Date();
//     const posts = await Post.find({ scheduledDate: { $lte: now }, posted: false });
//     res.json(posts);
//   } catch (error) {
//     console.error("Error fetching scheduled posts:", error);
//     res.status(500).json({ error: "Failed to fetch scheduled posts" });
//   }
// });

// // ✅ Delete a post by ID
// app.delete('/api/posts/:id', async (req, res) => {
//   try {
//     const postId = req.params.id;
//     const deletedPost = await Post.findByIdAndDelete(postId);

//     if (!deletedPost) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     res.status(200).json({ message: "Post deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting post:", error);
//     res.status(500).json({ message: "Failed to delete post" });
//   }
// });

// // Delete multiple posts
// app.post("/api/posts/bulk-delete", async (req, res) => {
//   try {
//     const { ids } = req.body;
//     if (!Array.isArray(ids) || ids.length === 0) {
//       return res.status(400).json({ error: "No IDs provided" });
//     }

//     await Post.deleteMany({ _id: { $in: ids } });

//     res.json({ message: "Posts deleted" });
//   } catch (error) {
//     console.error("Bulk delete failed:", error);
//     res.status(500).json({ error: "Bulk delete failed" });
//   }
// });


// // Edit post by ID
// app.get('/api/posts/:id', async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) {
//       return res.status(404).json({ error: 'Post not found' });
//     }
//     res.json(post);
//   } catch (error) {
//     console.error('Error fetching post by ID:', error);
//     res.status(500).json({ error: 'Failed to fetch post' });
//   }
// });
// // ✅ Update post by ID
// app.put('/api/posts/:id', upload.single('file'), async (req, res) => {
//   try {
//     const { title, content, client, scheduledDate } = req.body;

//     let selectedPlatforms = [];
//     if (req.body.selectedPlatforms) {
//       try {
//         selectedPlatforms = JSON.parse(req.body.selectedPlatforms);
//       } catch (error) {
//         console.error("Invalid Platform Data:", error);
//       }
//     }

//     const parsedDate = scheduledDate ? new Date(scheduledDate) : null;

//     let status = 'draft';
//     if (parsedDate) status = 'scheduled';

//     const updatedFields = {
//       title,
//       content,
//       client,
//       scheduledDate: parsedDate,
//       selectedPlatforms,
//       posted: false,
//       status
//     };


//     if (req.file) {
//       updatedFields.filePath = `/uploads/${req.file.filename}`;
//     }

//     const updatedPost = await Post.findByIdAndUpdate(
//       req.params.id,
//       updatedFields,
//       { new: true }
//     );

//     if (!updatedPost) {
//       return res.status(404).json({ error: "Post not found" });
//     }

//     res.status(200).json({ message: "Post updated", post: updatedPost });
//   } catch (error) {
//     console.error("Error updating post:", error);
//     res.status(500).json({ error: "Failed to update post" });
//   }
// });

// app.get('/api/posts/:postId/insights', async (req, res) => {
//   const postId = req.params.postId;
//   const accessToken = req.query.accessToken;

//   // 🔒 Token validation before making request
//   if (
//     !accessToken ||
//     typeof accessToken !== 'string' ||
//     !accessToken.startsWith('EAA')
//   ) {
//     console.warn("❌ Invalid or missing Facebook access token:", accessToken);
//     return res.status(400).json({
//       error: "Invalid or missing Facebook access token",
//     });
//   }

//   try {
//     let fields = 'likes.summary(true),comments.summary(true),shares';
//     let insights = {};

//     try {
//       const response = await axios.get(
//         `https://graph.facebook.com/v18.0/${postId}?fields=${fields}&access_token=${accessToken}`
//       );

//       const data = response.data;
//       insights.likes = data.likes?.summary?.total_count || 0;
//       insights.comments = data.comments?.summary?.total_count || 0;
//       insights.shares = data.shares?.count || 0;

//       return res.json(insights);
//     } catch (err) {
//       const msg = err.response?.data?.error?.message || '';
//       console.warn("📉 Fallback triggered due to error:", msg);

//       if (msg.includes('shares') || msg.includes('type')) {
//         const safeFields = 'likes.summary(true),comments.summary(true)';
//         const safeRes = await axios.get(
//           `https://graph.facebook.com/v18.0/${postId}?fields=${safeFields}&access_token=${accessToken}`
//         );
//         const safeData = safeRes.data;

//         insights.likes = safeData.likes?.summary?.total_count || 0;
//         insights.comments = safeData.comments?.summary?.total_count || 0;
//         insights.shares = 0;

//         return res.json(insights);
//       } else {
//         return res.status(500).json({ error: msg });
//       }
//     }
//   } catch (error) {
//     console.error('Facebook insights failed:', error?.response?.data || error.message);
//     res.status(500).json({ error: 'Failed to fetch post insights' });
//   }
// });




// // ===============================
// // 📌 **Client API Routes**
// // ===============================

// // ✅ Add a new client
// app.post('/api/clients', async (req, res) => {
//   try {
//     const { companyName, companyDetail, socialAccounts } = req.body;

//     if (!companyName) {
//       return res.status(400).json({ error: "Company name is required" });
//     }

//     const newClient = new Client({
//       companyName,
//       companyDetail,
//       socialAccounts  // expects array of { platform, companyToken, pageId }
//     });

//     await newClient.save();
//     res.status(201).json({ message: "Client added successfully", client: newClient });

//   } catch (error) {
//     console.error("Error adding client:", error);
//     res.status(500).json({ error: "Failed to add client" });
//   }
// });

// // ✅ Get all clients
// app.get('/api/clients', async (req, res) => {
//   try {
//     const clients = await Client.find();
    
//     res.json(clients);
//   } catch (error) {
//     console.error("Error fetching clients:", error);
//     res.status(500).json({ error: "Failed to fetch clients" });
//   }
// });

// // ✅ Edit Client
// app.put('/api/clients/:id', async (req, res) => {
//   try {
//     const { companyName, companyDetail, socialAccounts } = req.body;

//     if (!companyName) {
//       return res.status(400).json({ error: "Company name is required" });
//     }

//     const updatedClient = await Client.findByIdAndUpdate(
//       req.params.id,
//       { companyName, companyDetail, socialAccounts },
//       { new: true }
//     );

//     if (!updatedClient) {
//       return res.status(404).json({ error: "Client not found" });
//     }

//     res.status(200).json({ message: "Client updated successfully", client: updatedClient });
//   } catch (error) {
//     console.error("Error updating client:", error);
//     res.status(500).json({ error: "Failed to update client" });
//   }
// });

// // ✅ Delete Client
// app.delete('/api/clients/:id', async (req, res) => {
//   try {
//     const deletedClient = await Client.findByIdAndDelete(req.params.id);

//     if (!deletedClient) {
//       return res.status(404).json({ error: "Client not found" });
//     }

//     res.status(200).json({ message: "Client deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting client:", error);
//     res.status(500).json({ error: "Failed to delete client" });
//   }
// });


// // ===============================
// // 📌 **Accounts API Routes**
// // ===============================

// // ✅ Add a new account
// app.post('/api/accounts', async (req, res) => {
//   try {
//     const { name, email, phoneNum, address, password } = req.body;

//     if (!name || !email || !phoneNum || !address || !password) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const newAccount = new Account({ name, email, phoneNum, address, password });
//     await newAccount.save();

//     res.status(201).json({ message: "Account created successfully", account: newAccount });
//   } catch (error) {
//     console.error("Error creating account:", error);
//     res.status(500).json({ error: "Failed to create account" });
//   }
// });

// // ✅ Get all accounts
// app.get('/api/accounts', async (req, res) => {
//   try {
//     const accounts = await Account.find();
//     res.status(200).json(accounts);
//   } catch (error) {
//     console.error("Error fetching accounts:", error);
//     res.status(500).json({ error: "Failed to fetch accounts" });
//   }
// });

// // UPDATE account
// app.put('/api/accounts/:id', async (req, res) => {
//   try {
//     const updatedAccount = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updatedAccount) return res.status(404).json({ error: "Account not found" });
//     res.json({ account: updatedAccount });
//   } catch (error) {
//     console.error("Update failed:", error);
//     res.status(500).json({ error: "Failed to update account" });
//   }
// });

// // DELETE account
// app.delete('/api/accounts/:id', async (req, res) => {
//   try {
//     const deleted = await Account.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ error: "Account not found" });
//     res.json({ message: "Account deleted" });
//   } catch (error) {
//     console.error("Delete failed:", error);
//     res.status(500).json({ error: "Failed to delete account" });
//   }
// });


// // Function to post to Facebook
// const postToFacebook = async (post, client) => {
//   try {
//     const facebookAccount = client.socialAccounts.find(acc => acc.platform === "Facebook");

//     if (!facebookAccount || !facebookAccount.companyToken || !facebookAccount.pageId) {
//       console.error(`No valid Facebook account for client: ${client.companyName}`);
//       return false;
//     }

//     const pageAccessToken = facebookAccount.companyToken;
//     const pageId = facebookAccount.pageId;
//     console.log("Page Access Token:", pageAccessToken);

//     const url = `https://graph.facebook.com/${pageId}/feed`;

//     const formData = new FormData();
//     formData.append("message", `${post.content}\n\n${post.hashtags || ""}`);
//     formData.append("access_token", pageAccessToken);
//     formData.append("source", fs.createReadStream(path.join(__dirname, post.filePath)));

//     const response = await axios.post(url, formData, {
//       headers: formData.getHeaders(),
//     });

//     if (response.data.id) {
//       console.log(`Post successful: ${response.data.id}`);
//       return true;
//     }

//   } catch (error) {
//     console.error("Error posting to Facebook:", error.response?.data || error.message);
//   }
//   return false;
// };


// async function postToInstagram(post, client) {
//   try {
//     const instagramAccount = client.socialAccounts.find(acc => acc.platform === "Instagram");
//     if (!instagramAccount || !instagramAccount.companyToken || !instagramAccount.pageId) {
//       console.error(`No valid Instagram account for client: ${client.companyName}`);
//       return;
//     }

//     const accessToken = instagramAccount.companyToken;
//     const igUserId = instagramAccount.pageId;

//     const mediaUrl = `${"https://89cc-2001-e68-5456-3b90-7949-5b30-1168-d19e.ngrok-free.app"}${post.filePath}`;

//     if (!mediaUrl) {
//       console.error("❌ No valid image URL for Instagram post.");
//       return;
//     }

//     const message = `${post.content}\n\n${post.hashtags || ""}`;

//     // Step 1: Upload Media
//     const mediaResponse = await axios.post(
//       `https://graph.facebook.com/${igUserId}/media`,
//       {
//         image_url: mediaUrl,
//         caption: message,
//         access_token: accessToken,
//       }
//     );

//     const creationId = mediaResponse.data.id;

//     // Step 2: Publish Media
//     const publishResponse = await axios.post(
//       `https://graph.facebook.com/${igUserId}/media_publish`,
//       {
//         creation_id: creationId,
//         access_token: accessToken,
//       }
//     );

//     console.log('✅ Instagram Post ID:', publishResponse.data.id);
//     return true;

//   } catch (error) {
//     console.error('Error posting to Instagram:', error.response?.data || error.message);
//     return false;
//   }
// }


// const checkAndPostScheduledPosts = async () => {
//   try {
//     const now = new Date();
//     const posts = await Post.find({ scheduledDate: { $lte: now }, posted: false });

//     for (const post of posts) {
//       const client = await Client.findOne({ companyName: post.client });

//       if (!client) {
//         console.error(`Client not found for post: ${post._id}`);
//         continue;
//       }

//       if (post.selectedPlatforms.includes("facebook")) {
//         await postToFacebook(post, client);
//         post.posted = true;
//         await post.save();
//       }

//       if (post.selectedPlatforms.includes("instagram")) {
//         await postToInstagram(post, client);
//         post.posted = true;
//         await post.save();
//       }

//     }
//   } catch (error) {
//     console.error("Error checking scheduled posts:", error);
//   }
// };

// // Step 1: OAuth Login Route
// app.get('/auth/facebook', (req, res) => {
//   const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FB_APP_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=pages_show_list,pages_manage_posts,instagram_basic,instagram_content_publish&response_type=code`;
//   res.redirect(authUrl);
// });

// app.get('/auth/facebook/callback', async (req, res) => {
//   const { code } = req.query;

//   try {
//     // Step 2: Exchange code for access token
//     const tokenResponse = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
//       params: {
//         client_id: process.env.FB_APP_ID,
//         redirect_uri: process.env.REDIRECT_URI,
//         client_secret: process.env.FB_APP_SECRET,
//         code,
//       },
//     });

//     const shortLivedToken = tokenResponse.data.access_token;
//     console.log("Access Token:", shortLivedToken);

//     // Exchange short-lived for long-lived token
//     const longLivedResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
//       params: {
//         grant_type: 'fb_exchange_token',
//         client_id: process.env.FB_APP_ID,
//         client_secret: process.env.FB_APP_SECRET,
//         fb_exchange_token: shortLivedToken,
//       },
//     });

//     const longLivedAccessToken = longLivedResponse.data.access_token;
//     const expiresIn = longLivedResponse.data.expires_in || 60 * 24 * 60 * 60;
//     const expiresAt = new Date(Date.now() + expiresIn * 1000);

//     // Step 3: Use the access token to fetch user details
//     // Get list of pages
//     const pagesResponse = await axios.get(`https://graph.facebook.com/v18.0/me/accounts`, {
//       params: { access_token: longLivedAccessToken },
//     });
//     console.log("Pages:", pagesResponse.data);

//     const page = pagesResponse.data.data[0]; // Assuming the first page
//     if (!page) return res.status(400).json({ message: 'No page found' });

//     // Get Instagram Business ID
//     const igResponse = await axios.get(`https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account`, {
//       params: { access_token: page.access_token },
//     });

//     const instagramBusinessId = igResponse.data.instagram_business_account?.id || '';

//     const userResponse = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${longLivedAccessToken}`);
//     console.log("User Details:", userResponse.data);
//     const userId = userResponse.data.id; // ✅ Add this line

//     // Save Facebook pages
//     for (const page of pagesResponse.data.data) {

//       // Save Facebook client
//       await FacebookClient.findOneAndUpdate(
//         { userId, pageId: page.id },
//         {
//           userId,
//           pageId: page.id,
//           pageAccessToken: page.access_token,
//           pageName: page.name,
//           permissions: [],
//           expiresAt,
//         },
//         { upsert: true, new: true }
//       );

//       // Step 6: Get Instagram Business Account (if any)
//       const igResponse = await axios.get(`https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account`, {
//         params: { access_token: page.access_token },
//       });

//       const instagramBusinessId = igResponse.data.instagram_business_account?.id;
//       if (instagramBusinessId) {
//         await InstagramClient.findOneAndUpdate(
//           { userId, instagramBusinessId },
//           {
//             userId,
//             instagramBusinessId,
//             username: page.name,
//             accessToken: page.access_token,
//             permissions: [],
//             expiresAt,
//           },
//           { upsert: true, new: true }
//         );
//       }
//     }

//     // ✅ Only one response here
//     return res.json({
//       message: 'Facebook pages saved successfully.',
//       pageId: page.id,
//       instagramBusinessId
//     });
//   } 
  
//   catch (error) {
//     console.error("Error during Facebook OAuth:", error.response?.data || error.message);
//     res.status(500).json({ error: "Failed to authenticate with Facebook" });
//   }
// });


// // Express session
// app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

// // Serialize user
// passport.serializeUser((user, done) => {done(null, user);});
// passport.deserializeUser((obj, done) => {done(null, obj);});

// passport.use(new TwitterStrategy({
//   consumerKey: process.env.TWITTER_CONSUMER_KEY,
//   consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//   callbackURL: "http://localhost:5000/auth/twitter/callback"
// },
// function(token, tokenSecret, profile, done) {
//   // Save tokens to DB for future requests
//   // console.log('Twitter Profile:', profile);
//   console.log('Access Token:', token);
//   console.log('Token Secret:', tokenSecret);
//   return done(null, profile);
// }));

// // Step 1: Start the login process
// app.get('/auth/twitter', passport.authenticate('twitter'));

// // Step 2: Handle the callback
// app.get('/auth/twitter/callback',
//   passport.authenticate('twitter', { failureRedirect: '/login' }),
//   async function (req, res) {
//     try {
//       const twitterProfile = req.user; // From passport

//       await TwitterClient.findOneAndUpdate(
//         { userId: twitterProfile.id },
//         {
//           userId: twitterProfile.id,
//           username: twitterProfile.username,
//           name: twitterProfile.displayName,
//           accessToken: req.query.oauth_token || "",  // Optional
//           refreshToken: req.query.oauth_verifier || "" // Optional
//         },
//         { upsert: true, new: true }
//       );

//       res.json({
//         message: "✅ Twitter client saved",
//         user: {
//           id: twitterProfile.id,
//           username: twitterProfile.username,
//           name: twitterProfile.displayName
//         }
//       });

//     } catch (err) {
//       console.error("❌ Failed to save Twitter client:", err);
//       res.status(500).json({ error: "Failed to save Twitter client" });
//     }
//   }
// );

// const refreshFacebookToken = async (client) => {
//   try {
//     const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
//       params: {
//         grant_type: 'fb_exchange_token',
//         client_id: process.env.FB_APP_ID,
//         client_secret: process.env.FB_APP_SECRET,
//         fb_exchange_token: client.pageAccessToken,
//       },
//     });

//     const newAccessToken = response.data.access_token;
//     const expiresIn = response.data.expires_in || 60 * 24 * 60 * 60; // 60 days
//     const newExpiresAt = new Date(Date.now() + expiresIn * 1000);

//     await FacebookClient.findByIdAndUpdate(client._id, {
//       pageAccessToken: newAccessToken,
//       expiresAt: newExpiresAt
//     });

//     console.log(`🔄 Refreshed token for page "${client.pageName}"`);
//   } catch (error) {
//     console.error(`❌ Failed to refresh token for "${client.pageName}":`, error.response?.data || error.message);
//   }
// };

// const checkAndRefreshTokens = async () => {
//   const now = new Date();
//   const threshold = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

//   try {
//     const expiringTokens = await FacebookClient.find({ expiresAt: { $lte: threshold } });

//     for (const client of expiringTokens) {
//       await refreshFacebookToken(client);
//     }
//   } catch (err) {
//     console.error("❌ Error while checking/refreshing tokens:", err.message);
//   }
// };

// // 🔁 Check Facebook tokens once a day
// setInterval(checkAndRefreshTokens, 24 * 60 * 60 * 1000); // Every 24 hours
// checkAndRefreshTokens(); // Run immediately on server start

// // Run the function every minute
// setInterval(checkAndPostScheduledPosts, 60 * 1000);
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
  const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=http://localhost:5000/auth/linkedin/callback&scope=w_member_social&state=random123`;
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
        redirect_uri: "http://localhost:5000/auth/linkedin/callback",
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


app.get('/test', (req, res) => res.send('✅ Test route working'));


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


