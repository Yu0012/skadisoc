// const Client = require('../models/Client');
const User = require('../models/User');
const FacebookClient = require('../models/FacebookClientSchema');
const InstagramClient = require('../models/InstagramClientSchema');
const TwitterClient = require('../models/TwitterClientSchema');
const LinkedInClient = require('../models/LinkedInClientSchema');

const platformModels = {
  facebook: FacebookClient,
  instagram: InstagramClient,
  twitter: TwitterClient,
  linkedin: LinkedInClient,
};

// Utility to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ASSIGN USER TO CLIENT (SINGLE) (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN CLIENT.JSX & ACCOUNT.JSX
exports.assignUserToClient = async (req, res) => {
  const { platform, clientId, userId } = req.params;

  // Check permissions
  if (!(req.user.roleType === 'superadmin' || req.user.role === 'admin')) {
    return res.status(403).json({ message: 'Only superadmin with admin role can assign users' });
  }

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];
  const userField = `assigned${capitalize(platform)}Clients`;

  try {
    // Get user and client
    const user = await User.findById(userId);
    const client = await ClientModel.findById(clientId);

    if (!user || !client) {
      return res.status(404).json({ message: 'User or client not found' });
    }

    // Check if user is editor
    if (user.role !== 'editor') {
      return res.status(400).json({ message: 'Can only assign users with editor role' });
    }

    // Check if already assigned
    if (client.assignedAdmins.includes(userId) || user[userField].includes(clientId)) {
      return res.status(400).json({ message: 'User already assigned to this client' });
    }

    // Update both sides of relationship
    await ClientModel.findByIdAndUpdate(clientId, {
      $addToSet: { assignedAdmins: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { [userField]: clientId }
    });

    res.json({ message: 'User assigned to client successfully' });
  } catch (err) {
    console.error(`❌ Error assigning user to ${platform} client:`, err);
    res.status(500).json({ message: `Error assigning user to ${platform} client` });
  }
};

// UNASSIGN USER FROM CLIENT (SINGLE) (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN CLIENT.JSX & ACCOUNT.JSX
exports.unassignUserFromClient = async (req, res) => {
  const { platform, clientId, userId } = req.params;

  // Check permissions
  if (!(req.user.roleType === 'superadmin' || req.user.role === 'admin')) {
    return res.status(403).json({ message: 'Only superadmin with admin role can unassign users' });
  }

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];
  const userField = `assigned${capitalize(platform)}Clients`;

  try {
    // Remove from both sides
    await ClientModel.findByIdAndUpdate(clientId, {
      $pull: { assignedAdmins: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { [userField]: clientId }
    });

    res.json({ message: 'User unassigned from client successfully' });
  } catch (err) {
    console.error(`❌ Error unassigning user from ${platform} client:`, err);
    res.status(500).json({ message: `Error unassigning user from ${platform} client` });
  }
};

// ASSIGN MULTIPLE CLIENTS TO A USER (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN CLIENT.JSX, USERCREATEFORM.JSX & ACCOUNT.JSX
exports.assignMultipleClientsToUser = async (req, res) => {
  const { platform, userId } = req.params;
  const { clientIds } = req.body;

  // Check permissions
  if (!(req.user.roleType === 'superadmin' || req.user.role === 'admin')) {
    return res.status(403).json({ message: 'Only superadmin with admin role can assign clients' });
  }

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];
  const userField = `assigned${capitalize(platform)}Clients`;

  try {
    // Verify user is an editor
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'editor') {
      return res.status(400).json({ message: 'Can only assign clients to users with editor role' });
    }

    // Check if any client is already assigned to someone else
    const clients = await ClientModel.find({ 
      _id: { $in: clientIds },
      assignedAdmins: { $exists: true, $ne: [] }
    });

    if (clients.length > 0) {
      return res.status(400).json({ 
        message: 'Some clients are already assigned to other users',
        conflictedClients: clients.map(c => c._id)
      });
    }

    // First unassign any existing assignments to these clients
    await ClientModel.updateMany(
      { _id: { $in: clientIds } },
      { $set: { assignedAdmins: [] } }
    );

    // Assign all clients to this user
    await ClientModel.updateMany(
      { _id: { $in: clientIds } },
      { $addToSet: { assignedAdmins: userId } }
    );

    // Add clients to user's assigned clients
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { [userField]: { $each: clientIds } } }
    );

    res.json({ 
      message: 'Clients assigned to user successfully',
      clientCount: clientIds.length,
      userId: userId
    });
  } catch (err) {
    console.error(`❌ Error assigning multiple ${platform} clients to user:`, err);
    res.status(500).json({ message: `Error assigning ${platform} clients to user` });
  }
};

// UNASSIGN MULTIPLE CLIENTS FROM A USER (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN CLIENT.JSX & ACCOUNT.JSX
exports.unassignMultipleClientsFromUser = async (req, res) => {
  const { platform, userId } = req.params;
  const { clientIds } = req.body;

  // Check permissions
  if (!(req.user.roleType === 'superadmin' || req.user.role === 'admin')) {
    return res.status(403).json({ message: 'Only superadmin or admin can unassign clients' });
  }

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];
  const userField = `assigned${capitalize(platform)}Clients`;

  try {
    // Remove user from all specified clients
    await ClientModel.updateMany(
      { _id: { $in: clientIds }, assignedAdmins: userId },
      { $pull: { assignedAdmins: userId } }
    );

    // Remove clients from user's assigned clients
    await User.findByIdAndUpdate(
      userId,
      { $pull: { [userField]: { $in: clientIds } } }
    );

    res.json({ 
      message: 'Clients unassigned from user successfully',
      clientCount: clientIds.length,
      userId: userId
    });
  } catch (err) {
    console.error(`❌ Error unassigning multiple ${platform} clients from user:`, err);
    res.status(500).json({ message: `Error unassigning ${platform} clients from user` });
  }
};

// GET ALL CLIENTS (FILTERED BY PLATFORM AND PERMISSIONS) (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN, USER WITH ROLE 'EDITOR' ONLY GET THEIR OWN ASSIGNED CLIENTS) USED IN CLIENT.JSX
exports.getAllClients = async (req, res) => {
  const { platform } = req.params;

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];

  try {
    let clients;

    if (req.user.roleType === 'superadmin' || req.user.role === 'admin') {
      // Superadmin and admin can see all clients
      clients = await ClientModel.find()
        .populate('assignedAdmins', 'username email role roleType');
    } else if (req.user.role === 'editor') {
      // Editors can only see their assigned clients
      clients = await ClientModel.find({ assignedAdmins: req.user._id })
        .populate('assignedAdmins', 'username email role roleType');
    } else {
      return res.status(403).json({ message: 'Permission denied' });
    }

    res.json({
      platform,
      count: clients.length,
      clients
    });

  } catch (err) {
    console.error(`❌ Error fetching all ${platform} clients:`, err);
    res.status(500).json({ message: `Error fetching ${platform} clients` });
  }
};

// GET ALL UNASSIGNED CLIENTS (ADMIN ONLY) (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN CLIENT.JSX, CREATEUSERFORM.JSX & ACCOUNT.JSX
exports.getAllUnassignClients = async (req, res) => {
  const { platform } = req.params;

  if (!(req.user.roleType === 'superadmin' || req.user.role === 'admin')) {
    return res.status(403).json({ message: 'Only superadmin with admin role can view unassigned clients' });
  }

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];

  try {
    const unassignedClients = await ClientModel.find({
      $or: [
        { assignedAdmins: { $exists: false } },
        { assignedAdmins: { $size: 0 } }
      ]
    });

    res.json({
      platform,
      count: unassignedClients.length,
      clients: unassignedClients
    });
  } catch (err) {
    console.error(`❌ Error fetching unassigned ${platform} clients:`, err);
    res.status(500).json({ message: `Error fetching unassigned ${platform} clients` });
  }
};

// GET ALL ASSIGNED CLIENTS (FILTERED BY PERMISSIONS) (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN, USER WITH ROLE 'EDITOR' ONLY CAN GET THEIR OWN ASSIGNED CLIENTS) USED IN CREATEPOSTMODAL.JSX, CLIENT.JSX & ACCOUNT.JSX
exports.getAllAssignedClients = async (req, res) => {
  const { platform } = req.params;

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];

  try {
    let assignedClients;

    if (req.user.roleType === 'superadmin' || req.user.role === 'admin') {
      // Superadmin and admin can see all assigned clients
      assignedClients = await ClientModel.find({
        assignedAdmins: { $exists: true, $ne: [] }
      }).populate('assignedAdmins', 'username email role roleType');
    } else if (req.user.role === 'editor') {
      // Editors can only see their own assigned clients
      assignedClients = await ClientModel.find({
        assignedAdmins: req.user._id
      }).populate('assignedAdmins', 'username email role roleType');
    } else {
      return res.status(403).json({ message: 'Permission denied' });
    }

    res.json({
      platform,
      count: assignedClients.length,
      clients: assignedClients
    });
  } catch (err) {
    console.error(`❌ Error fetching assigned ${platform} clients:`, err);
    res.status(500).json({ message: `Error fetching assigned ${platform} clients` });
  }
};

// DELETE SINGLE CLIENT (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN CLIENT.JSX
exports.deleteOneClient = async (req, res) => {
  const { platform, clientId } = req.params;

  // Check permissions - only superadmin or admin can delete clients
  if (!(req.user.roleType === 'superadmin' || req.user.role === 'admin')) {
    return res.status(403).json({ message: 'Only superadmin with admin role can delete clients' });
  }

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];
  const userField = `assigned${capitalize(platform)}Clients`;

  try {
    // Find the client first to verify it exists
    const clientToDelete = await ClientModel.findById(clientId);
    if (!clientToDelete) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Delete the client
    const deleteResult = await ClientModel.findByIdAndDelete(clientId);

    // Remove this client from all users' assigned clients arrays
    await User.updateMany(
      {},
      { $pull: { [userField]: clientId } }
    );

    res.json({
      message: `${capitalize(platform)} client deleted successfully`,
      deletedClient: {
        id: deleteResult._id,
        name: deleteResult.pageName || deleteResult.username || deleteResult.name
      }
    });
  } catch (err) {
    console.error(`❌ Error deleting ${platform} client:`, err);
    res.status(500).json({ message: `Error deleting ${platform} client` });
  }
};

