// // // controllers/postController.js
// // const Post = require('../models/Post');
// // const Client = require('../models/Client');

// // // Create a post
// // exports.createPost = async (req, res) => {
// //   try {
// //     const { client, platform, title, content, media, scheduledAt, status } = req.body;

// //     const clientDoc = await Client.findById(client);

// //     if (!clientDoc) return res.status(404).json({ message: 'Client not found' });

// //     // Permission check
// //     const isSuperadmin = req.user.roleType === 'superadmin';
// //     const isAssignedAdmin = req.user.roleType === 'admin' &&
// //       clientDoc.assignedAdmins.some(id => id.toString() === req.user._id.toString());

// //     if (!isSuperadmin && !isAssignedAdmin) {
// //       return res.status(403).json({ message: 'You are not allowed to post for this client' });
// //     }

// //     const newPost = new Post({
// //       client,
// //       createdBy: req.user._id,
// //       platform,
// //       title,
// //       content,
// //       media,
// //       scheduledAt,
// //       status
// //     });

// //     await newPost.save();
// //     res.status(201).json(newPost);
// //   } catch (err) {
// //     console.error('❌ Error creating post:', err);
// //     res.status(500).json({ message: 'Server error' });
// //   }
// // };

// // controllers/postController.js
// const Post = require('../models/Post');
// const Client = require('../models/Client');
// const User = require('../models/User');

// // Create Post
// exports.createPost = async (req, res) => {
//   try {
//     const { title, content, platform, clientId, media, scheduledAt, status } = req.body;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     console.log('🟢 Create Post requested by:', req.user.username, '| Role:', userRole);

//     // Fetch client to check if it exists
//     const client = await Client.findById(clientId);
//     if (!client) {
//       console.log('❌ Client not found:', clientId);
//       return res.status(404).json({ message: 'Client not found' });
//     }

//     // Permission Check
//     if (userRole === 'admin') {
//       console.log('✅ Admin creating post for any client.');
//       // Admin can create post for any client
//     } else if (userRole === 'editor') {
//       const editor = await User.findById(userId);
//       if (!editor || !editor.assignedClients.includes(clientId)) {
//         console.log('⛔ Editor not assigned to client:', clientId);
//         return res.status(403).json({ message: 'Editor not assigned to this client' });
//       }
//       console.log('✅ Editor assigned to client, allowed to create post.');
//     } else {
//       console.log('⛔ User role not allowed to create posts');
//       return res.status(403).json({ message: 'You are not allowed to create posts' });
//     }

//     const newPost = new Post({
//       title,
//       content,
//       platform,
//       clientId,
//       media,
//       scheduledAt,
//       status,
//       createdBy: userId,
//     });

//     await newPost.save();
//     console.log('✅ Post created successfully:', newPost._id);
//     res.status(201).json(newPost);
//   } catch (err) {
//     console.error('❌ Error creating post:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Update Post
// exports.updatePost = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, content, platform, clientId, media, scheduledAt, status } = req.body;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     console.log('🟠 Update Post requested by:', req.user.username, '| Role:', userRole);

//     const post = await Post.findById(id);
//     if (!post) {
//       console.log('❌ Post not found:', id);
//       return res.status(404).json({ message: 'Post not found' });
//     }

//     const client = await Client.findById(post.clientId);
//     if (!client) {
//       console.log('❌ Client associated with post not found.');
//       return res.status(404).json({ message: 'Client not found' });
//     }

//     // Permission Check
//     if (userRole === 'admin') {
//       console.log('✅ Admin updating any post.');
//     } else if (userRole === 'editor') {
//       const editor = await User.findById(userId);
//       if (!editor || !editor.assignedClients.includes(post.clientId.toString())) {
//         console.log('⛔ Editor not assigned to this post client:', post.clientId);
//         return res.status(403).json({ message: 'Editor not assigned to this client' });
//       }
//       console.log('✅ Editor allowed to update post.');
//     } else {
//       console.log('⛔ User role not allowed to update posts');
//       return res.status(403).json({ message: 'You are not allowed to update posts' });
//     }

//     post.title = title;
//     post.content = content;
//     post.platform = platform;
//     post.clientId = clientId;
//     post.media = media;
//     post.scheduledAt = scheduledAt;
//     post.status = status;

//     await post.save();
//     console.log('✅ Post updated successfully:', post._id);
//     res.json(post);
//   } catch (err) {
//     console.error('❌ Error updating post:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Delete Post
// exports.deletePost = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     console.log('🔴 Delete Post requested by:', req.user.username, '| Role:', userRole);

//     const post = await Post.findById(id);
//     if (!post) {
//       console.log('❌ Post not found:', id);
//       return res.status(404).json({ message: 'Post not found' });
//     }

//     const client = await Client.findById(post.clientId);
//     if (!client) {
//       console.log('❌ Client associated with post not found.');
//       return res.status(404).json({ message: 'Client not found' });
//     }

//     // Permission Check
//     if (userRole === 'admin') {
//       console.log('✅ Admin deleting any post.');
//     } else if (userRole === 'editor') {
//       const editor = await User.findById(userId);
//       if (!editor || !editor.assignedClients.includes(post.clientId.toString())) {
//         console.log('⛔ Editor not assigned to this client:', post.clientId);
//         return res.status(403).json({ message: 'Editor not assigned to this client' });
//       }
//       console.log('✅ Editor allowed to delete post.');
//     } else {
//       console.log('⛔ User role not allowed to delete posts');
//       return res.status(403).json({ message: 'You are not allowed to delete posts' });
//     }

//     await post.remove();
//     console.log('✅ Post deleted successfully:', post._id);
//     res.json({ message: 'Post deleted successfully' });
//   } catch (err) {
//     console.error('❌ Error deleting post:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get All Posts (for Reading)
// exports.getAllPosts = async (req, res) => {
//   try {
//     const posts = await Post.find();
//     console.log('🔵 Retrieved all posts.');
//     res.json(posts);
//   } catch (err) {
//     console.error('❌ Error retrieving posts:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const Post = require('../models/Post');
const Client = require('../models/Client');
const User = require('../models/User');

// Create Post
exports.createPost = async (req, res) => {
    try {
        console.log('🟢 Attempting to create post');

        const { title, content, platform, clientId, media, scheduledAt, status } = req.body;

        if (!title || !content || !platform || !clientId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Fetch client first
        const client = await Client.findById(clientId);
        if (!client) {
            console.log('⛔ Client not found');
            return res.status(404).json({ message: 'Client not found' });
        }

        // Authorization check
        if (req.user.role === 'admin') {
            console.log('✅ Admin creating post');
            // Admin can always create
        } else if (req.user.role === 'editor') {
            if (!req.user.assignedClients.includes(clientId)) {
                console.log('⛔ Editor trying to create post for unassigned client');
                return res.status(403).json({ message: 'You are not assigned to this client' });
            }
            console.log('✅ Editor creating post for assigned client');
        } else {
            console.log('⛔ Viewer trying to create post');
            return res.status(403).json({ message: 'Viewers are not allowed to create posts' });
        }

        const newPost = new Post({
            title,
            content,
            media,
            platform,
            client: clientId,
            createdBy: req.user._id,
            status: status || 'draft', // default to draft
            scheduledAt,
        });

        await newPost.save();
        console.log('✅ Post created successfully:', newPost._id);
        res.json({ message: 'Post created successfully', post: newPost });
    } catch (err) {
        console.error('❌ Error creating post:', err);
        res.status(500).json({ message: 'Error creating post' });
    }
};

// Update Post
exports.updatePost = async (req, res) => {
    try {
        console.log('🟠 Attempting to update post');

        const { id } = req.params;
        const updateData = req.body;

        const post = await Post.findById(id);
        if (!post) {
            console.log('⛔ Post not found');
            return res.status(404).json({ message: 'Post not found' });
        }

        // Fetch related client
        const client = await Client.findById(post.client);

        // Authorization check
        if (req.user.role === 'admin') {
            console.log('✅ Admin updating post');
            // Admin can always update
        } else if (req.user.role === 'editor') {
            if (!req.user.assignedClients.includes(post.client.toString())) {
                console.log('⛔ Editor trying to update post for unassigned client');
                return res.status(403).json({ message: 'You are not assigned to this client' });
            }
            console.log('✅ Editor updating post for assigned client');
        } else {
            console.log('⛔ Viewer trying to update post');
            return res.status(403).json({ message: 'Viewers are not allowed to update posts' });
        }

        const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });
        console.log('✅ Post updated:', updatedPost._id);
        res.json({ message: 'Post updated successfully', post: updatedPost });
    } catch (err) {
        console.error('❌ Error updating post:', err);
        res.status(500).json({ message: 'Error updating post' });
    }
};

// Delete Post
exports.deletePost = async (req, res) => {
    try {
        console.log('🔴 Attempting to delete post');

        const { id } = req.params;

        const post = await Post.findById(id);
        if (!post) {
            console.log('⛔ Post not found');
            return res.status(404).json({ message: 'Post not found' });
        }

        // Fetch related client
        const client = await Client.findById(post.client);

        // Authorization check
        if (req.user.role === 'admin') {
            console.log('✅ Admin deleting post');
            // Admin can always delete
        } else if (req.user.role === 'editor') {
            if (!req.user.assignedClients.includes(post.client.toString())) {
                console.log('⛔ Editor trying to delete post for unassigned client');
                return res.status(403).json({ message: 'You are not assigned to this client' });
            }
            console.log('✅ Editor deleting post for assigned client');
        } else {
            console.log('⛔ Viewer trying to delete post');
            return res.status(403).json({ message: 'Viewers are not allowed to delete posts' });
        }

        await Post.findByIdAndDelete(id);
        console.log('✅ Post deleted successfully');
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('❌ Error deleting post:', err);
        res.status(500).json({ message: 'Error deleting post' });
    }
};

// Get All Posts (Anyone can read)
exports.getAllPosts = async (req, res) => {
    try {
        console.log('🟢 Fetching all posts');
        const posts = await Post.find().populate('client');
        res.json(posts);
    } catch (err) {
        console.error('❌ Error fetching posts:', err);
        res.status(500).json({ message: 'Error fetching posts' });
    }
};
