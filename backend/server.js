require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
});
const Post = mongoose.model("Post", postSchema);

// ✅ **Client Schema**
const clientSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyDetail: String,
  companyToken: String,
  apiToken: Boolean,
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

// ===============================
// 📌 **Client API Routes**
// ===============================

// ✅ Add a new client
app.post('/api/clients', async (req, res) => {
  try {
    const { companyName, companyDetail, companyToken, apiToken } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: "Company name is required" });
    }

    const newClient = new Client({ companyName, companyDetail, companyToken, apiToken });
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






// ===============================
// 📌 **Start Server**
// ===============================
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
