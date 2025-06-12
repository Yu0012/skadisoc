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


router.put('/user/username/:username', authenticateJWT, authController.updateUsername);
router.put('/user/email/:email', authenticateJWT, authController.updateEmail);


module.exports = router;
