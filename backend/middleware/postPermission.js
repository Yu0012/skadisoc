// const Post = require('../models/Post'); // Add this

// const canModifyClientPost = async (req, res, next) => {
//   const { roleType } = req.user;
//   let clientId = req.body.client || req.params.clientId;

//   try {
//     // If not in req.body or params, fetch clientId from the Post itself
//     if (!clientId && req.params.id) {
//       const post = await Post.findById(req.params.id);
//       if (!post) return res.status(404).json({ message: 'Post not found' });
//       clientId = post.client;
//     }

//     if (!clientId) {
//       return res.status(400).json({ message: 'Client ID missing or unresolved' });
//     }

//     // Superadmin can proceed
//     if (roleType === 'superadmin') return next();

//     const client = await Client.findById(clientId);
//     if (!client) return res.status(404).json({ message: 'Client not found' });

//     const isAssigned = client.assignedAdmins.includes(req.user._id);
//     if (roleType === 'admin' && isAssigned) return next();

//     return res.status(403).json({ message: 'Access denied. You cannot modify posts for this client.' });
//   } catch (err) {
//     console.error('❌ Error in canModifyClientPost middleware:', err);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// module.exports = { canModifyClientPost };
