// const Client = require('../models/Client');
const User = require('../models/User');
const FacebookClient = require('../models/FacebookClientSchema');
const InstagramClient = require('../models/InstagramClientSchema');
const TwitterClient = require('../models/TwitterClientSchema');

const platformModels = {
  facebook: FacebookClient,
  instagram: InstagramClient,
  twitter: TwitterClient,
};

// Utility to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ASSIGN USER TO CLIENT (SINGLE) (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN CLIENT.JSX & ACCOUNT.JSX
exports.assignUserToClient = async (req, res) => {
  const { platform, clientId, userId } = req.params;

  // Check permissions
  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
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
  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
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

// ASSIGN MULTIPLE USERS TO A CLIENT (ONLY SUPERADMIN WITH ADMIN ROLE CAN) 
exports.assignMultipleUsersToClient = async (req, res) => {
  const { platform, clientId } = req.params;
  const { userIds } = req.body;

  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
    return res.status(403).json({ message: 'Only superadmin with admin role can assign users' });
  }

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];
  const userField = `assigned${capitalize(platform)}Clients`;

  try {
    const client = await ClientModel.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const users = await User.find({ _id: { $in: userIds }, role: 'editor' });

    if (users.length !== userIds.length) {
      const validIds = users.map(u => u._id.toString());
      const invalidIds = userIds.filter(id => !validIds.includes(id));
      return res.status(400).json({ 
        message: 'Some users are not editors or do not exist', 
        invalidUserIds: invalidIds 
      });
    }

    // Assign client to each user and user to client
    await Promise.all([
      ClientModel.findByIdAndUpdate(clientId, {
        $addToSet: { assignedAdmins: { $each: userIds } }
      }),
      ...users.map(user =>
        User.findByIdAndUpdate(user._id, {
          $addToSet: { [userField]: clientId }
        })
      )
    ]);

    res.json({
      message: 'Users assigned to client successfully',
      userCount: userIds.length,
      clientId: clientId
    });

  } catch (err) {
    console.error(`❌ Error assigning multiple users to ${platform} client:`, err);
    res.status(500).json({ message: `Error assigning users to ${platform} client` });
  }
};

// UNASSIGN MULTIPLE USERS FROM A CLIENT (ONLY SUPERADMIN WITH ADMIN ROLE CAN)
exports.unassignMultipleUsersFromClient = async (req, res) => {
  const { platform, clientId } = req.params;
  const { userIds } = req.body;

  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
    return res.status(403).json({ message: 'Only superadmin with admin role can unassign users' });
  }

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];
  const userField = `assigned${capitalize(platform)}Clients`;

  try {
    const client = await ClientModel.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Unassign client from each user and remove users from client
    await Promise.all([
      ClientModel.findByIdAndUpdate(clientId, {
        $pull: { assignedAdmins: { $in: userIds } }
      }),
      ...userIds.map(userId =>
        User.findByIdAndUpdate(userId, {
          $pull: { [userField]: clientId }
        })
      )
    ]);

    res.json({
      message: 'Users unassigned from client successfully',
      userCount: userIds.length,
      clientId: clientId
    });

  } catch (err) {
    console.error(`❌ Error unassigning multiple users from ${platform} client:`, err);
    res.status(500).json({ message: `Error unassigning users from ${platform} client` });
  }
};

// MANY USER TO ONE CLIENT (REMOVED RESTRICTION)
// ASSIGN MULTIPLE CLIENTS TO A USER (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN CLIENT.JSX, USERCREATEFORM.JSX & ACCOUNT.JSX
exports.assignMultipleClientsToUser = async (req, res) => {
  const { platform, userId } = req.params;
  const { clientIds } = req.body;

  // Check permissions
  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
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

    // Assign all clients to this user (append only if not already assigned)
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
  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
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
  try {
    let deletedClient;

    switch (platform.toLowerCase()) {
      case "facebook":
        deletedClient = await FacebookClient.findByIdAndDelete(clientId);
        break;
      case "instagram":
        deletedClient = await InstagramClient.findByIdAndDelete(clientId);
        break;
      case "twitter":
        deletedClient = await TwitterClient.findByIdAndDelete(clientId);
        break;
      default:
        return res.status(400).json({ error: "Unsupported platform" });
    }

    if (!deletedClient) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.status(200).json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error("Error deleting client:", err);
    res.status(500).json({ error: "Failed to delete client" });
  }
};


exports.createOneClient = async (req, res) => {
  const { platform } = req.params;

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];

  try {
    const newClient = new ClientModel(req.body);
    const savedClient = await newClient.save();

    res.status(201).json({
      message: `${platform} client created successfully`,
      client: savedClient,
    });
  } catch (err) {
    console.error(`❌ Error creating ${platform} client:`, err);
    res.status(500).json({ message: `Error creating ${platform} client` });
  }
};


// GET USERS ASSIGNED TO A CLIENT (ONLY SUPERADMIN WITH ADMIN ROLE CAN)
exports.getAssignedUsers = async (req, res) => {
  const { platform, clientId } = req.params;

  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
    return res.status(403).json({ message: 'Only superadmin with admin role can view assigned users' });
  }

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];

  try {
    const client = await ClientModel.findById(clientId).populate('assignedAdmins', '-password');
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({
      message: 'Assigned users retrieved successfully',
      platform,
      count: client.assignedAdmins.length,
      assignedUsers: client.assignedAdmins
    });
  } catch (err) {
    console.error(`❌ Error retrieving assigned users for ${platform} client:`, err);
    res.status(500).json({ message: `Error retrieving assigned users for ${platform} client` });
  }
};

// GET USERS NOT ASSIGNED TO A CLIENT (ONLY SUPERADMIN WITH ADMIN ROLE CAN)
exports.getUnassignedUsers = async (req, res) => {
  const { platform, clientId } = req.params;

  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
    return res.status(403).json({ message: 'Only superadmin with admin role can view unassigned users' });
  }

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];
  const userField = `assigned${capitalize(platform)}Clients`;

  try {
    const client = await ClientModel.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const unassignedUsers = await User.find({
      role: 'editor',
      [userField]: { $ne: clientId } // clientId not in assigned client list
    });

    res.json({
      message: 'Unassigned users retrieved successfully',
      platform,
      count: unassignedUsers.length,
      unassignedUsers
    });
  } catch (err) {
    console.error(`❌ Error retrieving unassigned users for ${platform} client:`, err);
    res.status(500).json({ message: `Error retrieving unassigned users for ${platform} client` });
  }
};

// GET USER UNASSIGNED CLIENTS (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN CLIENT.JSX, CREATEUSERFORM.JSX & ACCOUNT.JSX
exports.getUserUnassignedClients = async (req, res) => {
  const { platform, userId } = req.params;

  // Check if user is superadmin with admin role
  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
    return res.status(403).json({ message: 'Only superadmin with admin role can view unassigned clients of a user' });
  }

  // Validate platform
  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];

  try {
    // Get clients where this specific user is NOT assigned
    const unassignedClients = await ClientModel.find({
      $or: [
        { assignedAdmins: { $exists: false } },
        { assignedAdmins: { $ne: userId } }
      ]
    });

    res.json({
      platform,
      userId,
      count: unassignedClients.length,
      clients: unassignedClients
    });
  } catch (err) {
    console.error(`❌ Error fetching unassigned ${platform} clients for user ${userId}:`, err);
    res.status(500).json({ message: `Error fetching unassigned ${platform} clients for the user` });
  }
};


exports.updateClient = async (req, res) => {
  const { platform, clientId } = req.params;

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];

  try {
    const updatedClient = await ClientModel.findByIdAndUpdate(
      clientId,
      req.body,
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({
      message: `${platform} client updated successfully`,
      client: updatedClient,
    });
  } catch (err) {
    console.error(`❌ Error updating ${platform} client:`, err);
    res.status(500).json({ message: `Error updating ${platform} client` });
  }
};

exports.getOneClient = async (req, res) => {
  const { platform, clientId } = req.params;

  if (!platformModels[platform]) {
    return res.status(400).json({ message: 'Invalid platform' });
  }

  const ClientModel = platformModels[platform];

  try {
    const client = await ClientModel.findById(clientId).populate('assignedAdmins', 'username email role');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (err) {
    console.error(`❌ Error fetching ${platform} client by ID:`, err);
    res.status(500).json({ message: `Error fetching ${platform} client` });
  }
};
