const Post = require('../models/Post');
const User = require('../models/User');
const axios = require('axios');
const FacebookClient = require('../models/FacebookClientSchema');
const InstagramClient = require('../models/InstagramClientSchema');
const TwitterClient = require('../models/TwitterClientSchema');
const LinkedInClient = require('../models/LinkedInClientSchema');
const Notification = require('../models/Notification');
const now = new Date();
const day = String(now.getDate()).padStart(2, '0');
const month = String(now.getMonth() + 1).padStart(2, '0');
const year = String(now.getFullYear()).slice(-2);
const minutes = String(now.getMinutes()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const formattedTime = `${day}/${month}/${year}, ${hours}:${minutes}`;

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
  // const { 
  //   content, 
  //   title, 
  //   client, 
  //   scheduledDate, 
  //   selectedPlatforms, 
  //   filePath 
  // } = req.body;
  const content = req.body.content;
  const title = req.body.title;
  const client = typeof req.body.client === "string" ? req.body.client.trim() : req.body.client;
  const clientName = req.body.clientName;
  const scheduledDate = req.body.scheduledDate;
  let selectedPlatforms = [];
  if (typeof platforms === 'string') {
  try {
    platforms = JSON.parse(platforms);
  } catch {
    platforms = [];
  }
}

  //const filePath = req.file ? `in-memory:${req.file.originalname}` : null;

  try {
    const requestingUser = req.user;
    console.log("🔥 Incoming Create Post Request");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("🔥 DEBUG client:", req.body.client, typeof req.body.client);

    //console.log("File:", req.file);

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
      clientName, // ✅ Add this
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      selectedPlatforms,
      //filePath,
      posted: false,
      status: scheduledDate ? 'scheduled' : 'draft',
      createdBy: requestingUser._id
    });

    await newPost.save();
    await Notification.create({
      type: 'post_created',
      message: `📢 Post titled "${newPost.title}" was created by ${requestingUser.username} at ${formattedTime}` ,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });

  } catch (err) {
    console.error('❌ Error creating post:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    body: req.body,
    //file: req.file,
    user: req.user,
  });
    res.status(500).json({ 
      message: 'Failed to create post',
      error: err.message 
    });
  }
};

// Add this new updatePost function
// exports.updatePost = async (req, res) => {
//   const { id } = req.params;
//   const updateData = req.body;

//   try {
//     const requestingUser = req.user;
//     const post = await Post.findById(id);

//     if (!post) {
//       return res.status(404).json({ message: 'Post not found' });
//     }

//     // Check permissions
//     if (requestingUser.role === 'viewer') {
//       return res.status(403).json({ message: 'Viewers cannot update posts' });
//     }

//     if (requestingUser.role === 'editor') {
//       // Editors can only update their own posts
//       if (!post.createdBy.equals(requestingUser._id)) {
//         return res.status(403).json({ message: 'You can only update your own posts' });
//       }
//     }

//     // Set updatedBy before saving
//     post._locals = { updatedBy: requestingUser._id };

//     // Update the post
//     const updatedPost = await Post.findByIdAndUpdate(
//       id, 
//       { 
//         ...updateData,
//         updatedBy: requestingUser._id,
//         status: updateData.scheduledDate ? 'scheduled' : 'draft'
//       }, 
//       { new: true }
//     )
//     .populate('createdBy', 'username email role')
//     .populate('updatedBy', 'username email role');

//     res.json({
//       message: 'Post updated successfully',
//       post: updatedPost
//     });
//   } catch (err) {
//     console.error('❌ Error updating post:', err);
//     res.status(500).json({ message: 'Failed to update post' });
//   }
// };
// UPDATE POST
exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const updateData = {
    ...req.body,
    selectedPlatforms: JSON.parse(req.body.selectedPlatforms || "[]"),
    scheduledDate: req.body.scheduledDate || null,
    //Path: req.file ? `/uploads/${req.file.filename}` : undefined,
  };

  try {
    const requestingUser = req.user;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Viewers cannot update anything
    if (requestingUser.role === 'viewer') {
      return res.status(403).json({ message: 'Viewers cannot update posts' });
    }

    // Superadmin + admin role: can update anything
    const isSuperAdminWithAdminRole = 
      requestingUser.roleType === 'superadmin' && requestingUser.role === 'admin';

    // Admins (not superadmin) or editors: can only update their own posts
    const isLimitedAdminOrEditor = 
      (requestingUser.role === 'admin' && requestingUser.roleType !== 'superadmin') ||
      requestingUser.role === 'editor';

    if (isLimitedAdminOrEditor && !post.createdBy.equals(requestingUser._id)) {
      return res.status(403).json({ message: 'You can only update your own posts' });
    }

    // Set updatedBy before saving
    updateData.updatedBy = requestingUser._id;
    if (updateData.scheduledDate) {
      updateData.status = 'scheduled';
    } else {
      updateData.status = 'draft';
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
      new: true
    })
      .populate('createdBy', 'username email role')
      .populate('updatedBy', 'username email role');

    await Notification.create({
      type: 'post_edited',
      message: `🗑️ Post titled "${req.body.title}" was edit by ${req.user.username} at ${formattedTime}`,
      createdBy: req.user._id
    });
      

    console.log('✅ Post updated:', updatedPost._id);
    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (err) {
    console.error('❌ Error updating post:', err);
    res.status(500).json({ message: 'Failed to update post' });
  }
};


// DELETE POST (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN)
exports.deletePost = async (req, res) => {
  console.log('🔴 Deleting post');

  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
    console.log('⛔ Delete failed: insufficient permission');
    return res.status(403).json({ message: 'Only superadmin with admin role can delete posts' });
  }

  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await Notification.create({
      type: 'post_deleted',
      message: `🗑️ Post titled "${post.title}" was deleted by ${req.user.username} at ${formattedTime}`,
      createdBy: req.user._id
    });

    // 🌐 Delete Facebook post
    if (post.platformPostIds?.facebook) {
      const fbClient = await FacebookClient.findOne({ pageName: post.clientName });
      if (fbClient && fbClient.pageAccessToken) {
        try {
          const url = `https://graph.facebook.com/${post.platformPostIds.facebook}`;
          await axios.delete(url, {
            params: { access_token: fbClient.pageAccessToken },
          });
          console.log(`✅ Deleted Facebook post: ${post.platformPostIds.facebook}`);
        } catch (err) {
          console.error("❌ Facebook deletion failed:", err.response?.data || err.message);
        }
      }
    }

    // 📸 Delete Instagram post
    if (post.platformPostIds?.instagram) {
      const igClient = await InstagramClient.findOne({ username: post.clientName });
      if (igClient && igClient.accessToken) {
        try {
          const url = `https://graph.facebook.com/${post.platformPostIds.instagram}`;
          await axios.delete(url, {
            params: { access_token: igClient.accessToken },
          });
          console.log(`✅ Deleted Instagram post: ${post.platformPostIds.instagram}`);
        } catch (err) {
          console.error("❌ Instagram deletion failed:", err.response?.data || err.message);
        }
      }
    }

    // 🐦 Delete Twitter post
    if (post.platformPostIds?.twitter) {
      const twClient = await TwitterClient.findOne({ username: post.clientName });
      if (twClient) {
        const {
          appKey,
          appSecret,
          accessToken,
          accessTokenSecret,
        } = twClient;

        if (appKey && appSecret && accessToken && accessTokenSecret) {
          const { TwitterApi } = require('twitter-api-v2');
          const twitter = new TwitterApi({
            appKey,
            appSecret,
            accessToken,
            accessSecret: accessTokenSecret,
          });

          try {
            await twitter.v2.deleteTweet(post.platformPostIds.twitter);
            console.log(`✅ Deleted Twitter post: ${post.platformPostIds.twitter}`);
          } catch (err) {
            console.error("❌ Twitter deletion failed:", err.data || err.message);
          }
        }
      }
    }

    // 🚮 Delete MongoDB post
    await Post.findByIdAndDelete(id);

    console.log('✅ Deleted post from DB:', post._id);

    res.json({ message: 'Post deleted from all platforms & DB' });

  } catch (err) {
    console.error('🔥 Error deleting post:', err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

