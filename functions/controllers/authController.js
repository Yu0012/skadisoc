const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const rolePermissions = require('../utils/rolePermissions');
const roleTypePermissions = require('../utils/roleTypePermissions');
const resolvePermissions = require('../utils/resolvePermissions');


exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

   // Get menu access from roleType
   const typeMenus = roleTypePermissions[user.roleType]?.menus || [];

   // Get actions from role
   const roleActions = rolePermissions[user.role]?.actions || [];
 
   // Combine into permission object
   // AFTER ✅ (Good)
   const resolvedPermissions = {
    menus: typeMenus,
    actions: roleActions,
  };


   const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      roleType: user.roleType,
      permissions: resolvedPermissions,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
};

exports.register = async (req, res) => {
  const { username, email, password, role, roleType, fullName, birthday, gender, profilePicture } = req.body;

  if (req.user.roleType !== 'superadmin') {
    return res.status(403).json({ message: 'Only superadmin can register users' });
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
  res.json({ message: 'User registered successfully' });
};
