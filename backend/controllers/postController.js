const Post = require('../models/Post');
const User = require('../models/User');
const FacebookClient = require('../models/FacebookClientSchema');
const InstagramClient = require('../models/InstagramClientSchema');
const TwitterClient = require('../models/TwitterClientSchema');
const LinkedInClient = require('../models/LinkedInClientSchema');


// GET all posts (accessible to all authenticated users)
exports.getAllPosts = async (req, res) => {
  try {
    console.log('🟢 Fetching all posts');
    
    const posts = await Post.find().sort({ createdAt: -1 }); // Sort by newest first
    
    res.json({
      count: posts.length,
      posts
    });
  } catch (err) {
    console.error('❌ Error fetching posts:', err);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// GET a single post by ID (accessible to all authenticated users)
exports.getPostById = async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log(`🟢 Fetching post with ID: ${id}`);
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (err) {
    console.error(`❌ Error fetching post with ID ${id}:`, err);
    res.status(500).json({ message: 'Error fetching post' });
  }
};

exports.createPost = async (req, res) => {
  const content = req.body.content;
  const title = req.body.title;
  const client = req.body.client?.trim();
  const scheduledDate = req.body.scheduledDate;
  const selectedPlatforms = JSON.parse(req.body.selectedPlatforms || "[]");
  const filePath = req.file?.path || null;

  try {
    const requestingUser = req.user;

    // Check if user is viewer - viewers can't create posts
    if (requestingUser.role === 'viewer') {
      return res.status(403).json({ 
        message: 'Viewers are not allowed to create posts' 
      });
    }

    // Check if client is provided
    if (!client) {
      return res.status(400).json({ 
        message: 'Client is required' 
      });
    }

    // For editors - check if they are assigned to this client
    if (requestingUser.role === 'editor') {
      // Get all assigned clients across all platforms
      const assignedClients = [
        ...requestingUser.assignedFacebookClients,
        ...requestingUser.assignedInstagramClients,
        ...requestingUser.assignedTwitterClients,
        ...requestingUser.assignedLinkedInClients
      ].map(id => id.toString());

      if (!assignedClients.includes(client)) {
        return res.status(403).json({ 
          message: 'You can only create posts for your assigned clients' 
        });
      }
    }

    // For admins/superadmins - no additional checks needed
    const newPost = new Post({
      content,
      title,
      client,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      selectedPlatforms,
      filePath,
      posted: false,
      status: scheduledDate ? 'scheduled' : 'draft',
      createdBy: requestingUser._id
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });

  } catch (err) {
    console.error('❌ Error creating post:', err);
    res.status(500).json({ 
      message: 'Failed to create post',
      error: err.message 
    });
  }
};