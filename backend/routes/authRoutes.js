const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const rolePermissions = require('../utils/rolePermissions');
const roleTypePermissions = require('../utils/roleTypePermissions');
const { authenticateJWT, checkPermission, checkRole } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

const { Parser } = require('json2csv'); // npm install json2csv

// Test route
router.get('/ping', (req, res) => {
  res.send('Auth route is working ✅');
});

// Create Superadmin
// router.post('/create-superadmin', async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     // Check if already exists
//     const existing = await User.findOne({ username });
//     if (existing) return res.status(409).json({ message: 'User already exists' });

//     const newUser = new User({
//       username,
//       email,
//       password,
//       role: 'admin',
//       roleType: 'superadmin', // ✅ THIS LINE
//       permissions: {
//         menus: ['*'],
//         actions: ['*'],
//       },
//     });
    

//     await newUser.save();
//     res.status(201).json({ message: 'Superadmin created ✅' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Something went wrong ❌' });
//   }
// });


// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: 'User not found' });
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//     console.log("Email received:", email);
//     console.log("Password received:", password);
//     console.log("User found:", user);
//     console.log("Stored hash:", user?.password);

//     const typeMenus = roleTypePermissions[user.roleType]?.menus || [];
//     const roleActions = rolePermissions[user.role]?.actions || [];

//     const resolvedPermissions = {
//       menus: typeMenus,
//       actions: roleActions,
//     };
    
//     const payload = {
//       id: user._id,
//       role: user.role,
//       roleType: user.roleType, // ← ADD THIS LINE
//       permissions: resolvedPermissions,
//     };

//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.json({ token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Login failed' });
//   }
// });


// Login
router.post('/login', authController.login);

// Register User (must be logged in as superadmin+admin)
router.post('/register', authenticateJWT, authController.register);

// Read all Users
router.get('/users', authenticateJWT, authController.getUsers);

router.get('/user/id/:id', authenticateJWT, authController.getUserById);
router.get('/user/username/:username', authenticateJWT, authController.getUserByUsername);
router.get('/user/email/:email', authenticateJWT, authController.getUserByEmail);

router.get('/users/export', authenticateJWT, authController.exportUsers);

// Update User
router.put('/users/:id', authenticateJWT, authController.updateUser);

// Delete User
router.delete('/users/:id', authenticateJWT, authController.deleteUser);

router.get("/me", authenticateJWT, authController.getMe);

router.get('/user/:userId', authenticateJWT, authController.getPostsByUser);

// Activate / Deactivate User (only superadmin with admin role)
router.put('/user/activation', authenticateJWT, authController.isActiveUpdate);


router.put('/reset-password', authenticateJWT, authController.resetPassword);

// Logout
router.post('/logout', authenticateJWT, authController.logout); // 🔥 New logout route


module.exports = router;
