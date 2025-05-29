const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const rolePermissions = require('../utils/rolePermissions');
const roleTypePermissions = require('../utils/roleTypePermissions');
const resolvePermissions = require('../utils/resolvePermissions');
const crypto = require('crypto');

//LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // ❗️ Add this check:
    if (!user.isActive) {
      console.log('⛔ Attempted login by deactivated user:', user.email, ' with ' ,user.username);
      return res.status(403).json({ message: 'Account is deactivated. Please contact administrator.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log("✅ Email received:", email);
    console.log("✅ Password received:", password);
    console.log("✅ User found:", user);
    console.log("✅ Stored hash:", user?.password);

    // Get menus from roleType
    const typeMenus = roleTypePermissions[user.roleType]?.menus || [];

    // Get actions from role
    const roleActions = rolePermissions[user.role]?.actions || [];

    const resolvedPermissions = {
      menus: typeMenus,
      actions: roleActions,
    };

    const payload = {
      id: user._id,
      role: user.role,
      roleType: user.roleType,
      permissions: resolvedPermissions,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Update status and lastLogin
    user.status = 'online';
    user.lastLogin = new Date();
    await user.save();

    console.log('✅ User logged in:', user.username);

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};

//REGISTER (ONLY ROLETYPE WITH 'SUPERADMIN' & ROLE WITH 'ADMIN' CAN)
exports.register = async (req, res) => {
  const { username, email, password, role, roleType, fullName, birthday, gender, profilePicture } = req.body;

  console.log('🔵 Attempting to register new user');

  // Check if user has both roleType: superadmin and role: admin
  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
    console.log(`❌ Unauthorized attempt to register by ${req.user.username} with roleType: ${req.user.roleType}, role: ${req.user.role}`);
    return res.status(403).json({ message: 'Only superadmin with admin role can register users' });
  }
  
  if (!['superadmin', 'admin', 'user'].includes(roleType)) {
    return res.status(400).json({ message: 'Invalid roleType value' });
  }

  const typeMenus = roleTypePermissions[roleType]?.menus || [];
  const roleActions = rolePermissions[role]?.actions || [];

  const userPermissions = {
    menus: typeMenus,
    actions: roleActions,
  };

  const newUser = new User({
    username,
    email,
    password,
    role,
    roleType,
    permissions: userPermissions,
    fullName,
    birthday,
    gender,
    profilePicture,
  });

  await newUser.save();
  console.log('✅ User registered successfully:', username);
  res.json({ message: 'User registered successfully' });
};

// GET ALL USERS
exports.getUsers = async (req, res) => {
  console.log('🟢 Fetching users');
  if (req.user.roleType !== 'superadmin' || req.user.role !== 'admin') {
    console.log('⛔ Fetch users failed: insufficient permission');
    return res.status(403).json({ message: 'Only superadmin with admin role can view users' });
  }

  const users = await User.find();
  res.json(users);
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  console.log('🟠 Updating user');
  if (req.user.roleType !== 'superadmin' || req.user.role !== 'admin') {
    console.log('⛔ Update failed: insufficient permission');
    return res.status(403).json({ message: 'Only superadmin with admin role can update users' });
  }

  const { id } = req.params;
  const updateData = req.body;

  try {
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Detect role or roleType changes
    const roleChanged = updateData.role && updateData.role !== existingUser.role;
    const roleTypeChanged = updateData.roleType && updateData.roleType !== existingUser.roleType;

    if (roleChanged || roleTypeChanged) {
      // Update permissions based on new role and/or roleType
      const newRole = updateData.role || existingUser.role;
      const newRoleType = updateData.roleType || existingUser.roleType;

      const updatedActions = rolePermissions[newRole]?.actions || [];
      const updatedMenus = roleTypePermissions[newRoleType]?.menus || [];

      updateData.permissions = {
        actions: updatedActions,
        menus: updatedMenus,
      };

      console.log(`🔁 Permissions updated due to ${roleChanged ? 'role' : ''}${roleChanged && roleTypeChanged ? ' and ' : ''}${roleTypeChanged ? 'roleType' : ''} change`);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

    console.log('✅ User updated:', updatedUser.username);
    res.json({ message: 'User updated successfully', user: updatedUser });

    if (updateData.hasOwnProperty('isActive')) {
      console.log(`🔄 User ${updatedUser.username} activation status changed to: ${updateData.isActive}`);
    }
  } catch (err) {
    console.error('❌ Error updating user:', err);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  console.log('🔴 Deleting user');
  if (req.user.roleType !== 'superadmin' || req.user.role !== 'admin') {
    console.log('⛔ Delete failed: insufficient permission');
    return res.status(403).json({ message: 'Only superadmin with admin role can delete users' });
  }

  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('✅ User deleted:', deletedUser.username);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) {
          console.log('❌ Logout failed: user not found');
          return res.status(404).json({ message: 'User not found' });
      }

      user.status = 'offline';
      user.lastLogin = new Date(); // Set the last login when they logout too
      await user.save();

      console.log('✅ User logged out:', user.username);
      res.json({ message: 'Logged out successfully' });
  } catch (err) {
      console.error('❌ Error during logout:', err);
      res.status(500).json({ message: 'Logout failed' });
  }
};
