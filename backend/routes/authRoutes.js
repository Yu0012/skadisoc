const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const rolePermissions = require('../utils/rolePermissions');
const roleTypePermissions = require('../utils/roleTypePermissions');
const { authenticateJWT, checkPermission, checkRole } = require('../middleware/authMiddleware');

// Test route
router.get('/ping', (req, res) => {
  res.send('Auth route is working ✅');
});

// Create Superadmin
router.post('/create-superadmin', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if already exists
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const newUser = new User({
      username,
      email,
      password,
      role: 'admin',
      roleType: 'superadmin', // ✅ THIS LINE
      permissions: {
        menus: ['*'],
        actions: ['*'],
      },
    });
    

    await newUser.save();
    res.status(201).json({ message: 'Superadmin created ✅' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong ❌' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log("Email received:", email);
    console.log("Password received:", password);
    console.log("User found:", user);
    console.log("Stored hash:", user?.password);

    const typeMenus = roleTypePermissions[user.roleType]?.menus || [];
    const roleActions = rolePermissions[user.role]?.actions || [];

    const resolvedPermissions = {
      menus: typeMenus,
      actions: roleActions,
    };
    
    const payload = {
      id: user._id,
      role: user.role,
      roleType: user.roleType, // ← ADD THIS LINE
      permissions: resolvedPermissions,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});


router.post(
  '/create-post',
  authenticateJWT,            // ✅ Triggers Passport JWT
  checkPermission('create_post'), 
  (req, res) => {
    res.json({ message: `✅ Post created by ${req.user.username}` });
  }
);


// Register User (Only superadmin can create users)
router.post(
  '/register',
  authenticateJWT,
  async (req, res) => {
    try {
      // Only allow superadmin to create new users
      if (req.user.role !== 'admin' || req.user.permissions.actions.includes('*') === false) {
        return res.status(403).json({ message: 'Only admins can create users' });
      }

      const {
        username,
        email,
        password,
        role,
        roleType,
        fullName,
        birthday,
        gender,
        profilePicture
      } = req.body;

      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const typeMenus = roleTypePermissions[roleType]?.menus || [];
      const roleActions = rolePermissions[role]?.actions || [];

      const permissions = {
        menus: typeMenus,
        actions: roleActions,
      };


      const newUser = new User({
        username,
        email,
        password,
        role,
        roleType,
        permissions,
        fullName,
        birthday,
        gender,
        profilePicture,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'offline'
      });

      await newUser.save();
      res.status(201).json({ message: '✅ User registered successfully' });
    } catch (err) {
      console.error('Error during registration:', err);
      res.status(500).json({ message: 'Server error', details: err.message });
    }
  }
);

// Get all users – Superadmin only
router.get(
  '/users',
  authenticateJWT,
  checkRole('superadmin'),
  async (req, res) => {
    try {
      const users = await User.find().select('-password'); // Exclude passwords
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to retrieve users' });
    }
  }
);


router.get(
  '/roles',
  authenticateJWT,
  checkRole('superadmin'),
  (req, res) => {
    res.json(rolePermissions);
  }
);

router.put(
  '/users/:id',
  authenticateJWT,
  checkRole('superadmin'),
  async (req, res) => {
    try {
      const { role, permissions } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          ...(role && { role }),
          ...(permissions && { permissions }),
        },
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User updated successfully ✅', user: updatedUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Update failed ❌' });
    }
  }
);

module.exports = router;
