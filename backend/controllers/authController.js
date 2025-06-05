const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const rolePermissions = require('../utils/rolePermissions');
const roleTypePermissions = require('../utils/roleTypePermissions');
const resolvePermissions = require('../utils/resolvePermissions');
const crypto = require('crypto');

const { Parser } = require('json2csv'); // npm install json2csv

//LOGIN USED IN AUTHFORM.JSX
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

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

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

//REGISTER (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN USERCREATEFORM.JSX
exports.register = async (req, res) => {
  // const { username, email, password, role, roleType, fullName, birthday, gender, profilePicture } = req.body;
  const { username, email, password, role, roleType } = req.body;

  console.log('🔵 Attempting to register new user');

  // Check if user has both roleType: superadmin and role: admin
  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
    console.log(`❌ Unauthorized attempt to register by ${req.user.username} with roleType: ${req.user.roleType}, role: ${req.user.role}`);
    return res.status(403).json({ message: 'Only superadmin with admin role can register new users' });
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
    // fullName,
    // birthday,
    // gender,
    // profilePicture,
  });

  await newUser.save();
  console.log('✅ User registered successfully:', username);
  res.json({ message: 'User registered successfully' });
};

// GET ALL USERS (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN ACCOUNT.JSX
// GET ALL USERS (WITH PAGINATION & ADVANCED SEARCH)
//GET /api/users?role=admin&isActive=true
//GET /api/users?startCreatedAt=2024-01-01&endCreatedAt=2024-12-31
//GET /api/users?sortBy=lastLogin&sortOrder=desc
//GET /api/users?search=amy&sortBy=username&order=asc&page=1&pageSize=10
// exports.getUsers = async (req, res) => {
//   console.log('🟢 Fetching users with filters/sort/pagination/search');

//   if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
//     console.log('⛔ Fetch users failed: insufficient permission');
//     return res.status(403).json({ message: 'Only superadmin with admin role can view users' });
//   }

//   try {
//     const {
//       roleType,
//       role,
//       status,
//       isActive,
//       startLastLogin,
//       endLastLogin,
//       startCreatedAt,
//       endCreatedAt,
//       startUpdatedAt,
//       endUpdatedAt,
//       sortBy,
//       sortOrder = 'asc',
//       username,
//       email,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const query = {};

//     if (roleType) query.roleType = roleType;
//     if (role) query.role = role;
//     if (status) query.status = status;
//     if (typeof isActive !== 'undefined') query.isActive = isActive === 'true' || isActive === true;


//     // Regex filters for advanced search
//     if (username) query.username = { $regex: username, $options: 'i' };
//     if (email) query.email = { $regex: email, $options: 'i' };

//     // Date range filters
//     if (startLastLogin || endLastLogin) {
//       query.lastLogin = {};
//       if (startLastLogin) query.lastLogin.$gte = new Date(startLastLogin);
//       if (endLastLogin) query.lastLogin.$lte = new Date(endLastLogin);
//     }

//     if (startCreatedAt || endCreatedAt) {
//       query.createdAt = {};
//       if (startCreatedAt) query.createdAt.$gte = new Date(startCreatedAt);
//       if (endCreatedAt) query.createdAt.$lte = new Date(endCreatedAt);
//     }

//     if (startUpdatedAt || endUpdatedAt) {
//       query.updatedAt = {};
//       if (startUpdatedAt) query.updatedAt.$gte = new Date(startUpdatedAt);
//       if (endUpdatedAt) query.updatedAt.$lte = new Date(endUpdatedAt);
//     }

//     // Sorting
//     const sortFields = {
//       id: '_id',
//       username: 'username',
//       email: 'email',
//       lastLogin: 'lastLogin',
//       createdAt: 'createdAt',
//       updatedAt: 'updatedAt',
//     };

//     const sortField = sortFields[sortBy] || '_id';
//     const sort = {};
//     sort[sortField] = sortOrder === 'desc' ? -1 : 1;

//     // Pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const total = await User.countDocuments(query);

//     const users = await User.find(query).sort(sort).skip(skip).limit(parseInt(limit));

//     res.set({
//       'X-Total-Count': total,
//       'X-Page': page,
//       'X-Pages': Math.ceil(total / limit),
//       'X-Limit': limit
//     });
//     res.json(users);


//   } catch (err) {
//     console.error('❌ Error fetching users with filters:', err);
//     res.status(500).json({ message: 'Failed to fetch users with filters' });
//   }
// };
// GET ALL USERS WITHOUT FILTER/SORT/PAGINATION (ONLY SUPERADMIN & ADMIN CAN)
exports.getUsers = async (req, res) => {
  console.log('🟢 Fetching all users (no filters)');

  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
    console.log('⛔ Fetch users failed: insufficient permission');
    return res.status(403).json({ message: 'Only superadmin with admin role can view users' });
  }

  try {
    const users = await User.find().sort({ createdAt: -1 });
    // res.json(users);
    res.json({
      count: users.length,
      users
    });
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};


// GET USER BY ID SEARCH FUNCTION (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN ACCOUNT.JSX
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
    console.log('⛔ Fetch by ID failed: insufficient permission');
    return res.status(403).json({ message: 'Only superadmin with admin role can view users' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('❌ Error fetching user by ID:', err);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// GET USER BY USERNAME SEARCH FUNCTION (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN ACCOUNT.JSX
exports.getUserByUsername = async (req, res) => {
  const { username } = req.params;

  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
    console.log('⛔ Fetch by username failed: insufficient permission');
    return res.status(403).json({ message: 'Only superadmin with admin role can view users' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('❌ Error fetching user by username:', err);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// GET USER BY EMAIL SEARCH FUNCTION (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN ACCOUNT.JSX
exports.getUserByEmail = async (req, res) => {
  const { email } = req.params;

  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
    console.log('⛔ Fetch by email failed: insufficient permission');
    return res.status(403).json({ message: 'Only superadmin with admin role can view users' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('❌ Error fetching user by email:', err);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// EXPORT USER DATA USING JSON/CSV (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN ACCOUNT.JSX
exports.exportUsers = async (req, res) => {
  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
    return res.status(403).json({ message: 'Only superadmin with admin role can export users' });
  }

  try {
    const users = await User.find().lean(); // All users

    const format = req.query.format || 'json'; // Default to JSON

    if (format === 'csv') {
      const fields = ['_id', 'username', 'email', 'role', 'roleType', 'status', 'isActive', 'lastLogin', 'createdAt', 'updatedAt'];
      const parser = new Parser({ fields });
      const csv = parser.parse(users);
      res.header('Content-Type', 'text/csv');
      res.attachment('users.csv');
      return res.send(csv);
    } else {
      return res.json(users);
    }
  } catch (err) {
    console.error('❌ Failed to export users:', err);
    res.status(500).json({ message: 'Export failed' });
  }
};


// UPDATE USER (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN ACCOUNT.JSX
exports.updateUser = async (req, res) => {
  console.log('🟠 Updating user');
  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
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

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
      console.log('🔐 Password was hashed before update');
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

// DELETE USER (ONLY USER WITH ROLETYPE 'SUPERADMIN' & ROLE 'ADMIN' CAN) USED IN ACCOUNT.JSX
exports.deleteUser = async (req, res) => {
  console.log('🔴 Deleting user');
  if (!(req.user.roleType === 'superadmin' && req.user.role === 'admin')) {
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

// RESET PASSWORD - USED IN ResetPassword.jsx
exports.resetPassword = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is same as current password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    // Set and save new password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('❌ Error resetting password:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};
