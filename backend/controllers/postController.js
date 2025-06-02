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
