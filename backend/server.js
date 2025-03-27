require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { platform } = require('os');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Use built-in JSON parsing
app.use(express.static('uploads')); // Serve uploaded files

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

// ✅ **Post Schema**
const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  hashtags: String,
  client: String,
  scheduledDate: Date,
  selectedPlatforms: [String],
  filePath: String, // Store file path if uploaded
  posted: { type: Boolean, default: false },
});
const Post = mongoose.model("Post", postSchema);

// ✅ **Client Schema**
const clientSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyDetail: String,
  socialAccounts: [
    {
      platform: { type: String, required: true }, // Example: "Facebook"
      companyToken: String,
      pageId: String
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
// 📌 **Post API Routes**
// ===============================

// ✅ Create a new post (with optional file upload)
app.post('/api/posts', upload.single('file'), async (req, res) => {
  try {
    const { content, hashtags, client, scheduledDate } = req.body;

    let selectedPlatforms = [];
    if (req.body.selectedPlatforms) {
      try {
        selectedPlatforms = JSON.parse(req.body.selectedPlatforms);
      } catch (error) {
        console.error("Error parsing selectedPlatforms:", error);
      }
    }

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const newPost = new Post({
      content,
      hashtags,
      client,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      selectedPlatforms, // Now correctly stored as an array
      filePath: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// ✅ Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.get('/api/scheduled-posts', async (req, res) => {
  try {
    const now = new Date();
    const posts = await Post.find({ scheduledDate: { $lte: now }, posted: false });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    res.status(500).json({ error: "Failed to fetch scheduled posts" });
  }
});

// ✅ Delete a post by ID
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

// Delete multiple posts
app.post("/api/posts/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided" });
    }

    await Post.deleteMany({ _id: { $in: ids } });

    res.json({ message: "Posts deleted" });
  } catch (error) {
    console.error("Bulk delete failed:", error);
    res.status(500).json({ error: "Bulk delete failed" });
  }
});


// Edit post by ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});
// ✅ Update post by ID
app.put('/api/posts/:id', upload.single('file'), async (req, res) => {
  try {
    const { content, hashtags, client, scheduledDate } = req.body;

    let selectedPlatforms = [];
    if (req.body.selectedPlatforms) {
      try {
        selectedPlatforms = JSON.parse(req.body.selectedPlatforms);
      } catch (error) {
        console.error("Invalid Platform Data:", error);
      }
    }

    const updatedFields = {
      content,
      hashtags,
      client,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      selectedPlatforms,
    };

    if (req.file) {
      updatedFields.filePath = `/uploads/${req.file.filename}`;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json({ message: "Post updated", post: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});




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
    res.status(200).json(clients);
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


// Function to post to Facebook
const postToFacebook = async (post, client) => {
  try {
    const facebookAccount = client.socialAccounts.find(acc => acc.platform === "Facebook");

    if (!facebookAccount || !facebookAccount.companyToken || !facebookAccount.pageId) {
      console.error(`No valid Facebook account for client: ${client.companyName}`);
      return false;
    }

    const pageAccessToken = facebookAccount.companyToken;
    const pageId = facebookAccount.pageId;
    console.log("Page Access Token:", pageAccessToken);

    const url = `https://graph.facebook.com/${pageId}/feed`;

    const postData = {
      message: `${post.content}\n\n${post.hashtags || ""}`,
      access_token: pageAccessToken,
    };

    const response = await axios.post(url, postData);
    
    if (response.data.id) {
      console.log(`Post successful: ${response.data.id}`);
      return true;
    }
  } catch (error) {
    console.error("Error posting to Facebook:", error.response?.data || error.message);
  }
  return false;
};

const checkAndPostScheduledPosts = async () => {
  try {
    const now = new Date();
    const posts = await Post.find({ scheduledDate: { $lte: now }, posted: false });

    for (const post of posts) {
      const client = await Client.findOne({ companyName: post.client });

      if (!client) {
        console.error(`Client not found for post: ${post._id}`);
        continue;
      }

      const success = await postToFacebook(post, client);

      if (success) {
        post.posted = true;
        await post.save();
      }
    }
  } catch (error) {
    console.error("Error checking scheduled posts:", error);
  }
};

// Run the function every minute
setInterval(checkAndPostScheduledPosts, 60 * 1000);

// ===============================
// 📌 **Start Server**
// ===============================
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
