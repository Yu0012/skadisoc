const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const rolePermissions = require('../utils/rolePermissions');
const roleTypePermissions = require('../utils/roleTypePermissions');
const { authenticateJWT, checkPermission, checkRole } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

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

// Update User
router.put('/users/:id', authenticateJWT, authController.updateUser);

// Delete User
router.delete('/users/:id', authenticateJWT, authController.deleteUser);

// Logout
router.post('/logout', authenticateJWT, authController.logout); // 🔥 New logout route

module.exports = router;
