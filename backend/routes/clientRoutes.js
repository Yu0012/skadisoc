const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Client = require('../models/Client');
const rolePermissions = require('../utils/rolePermissions');

// routes/clientRoutes.js
router.post('/assign-client', authenticateJWT, checkRole('superadmin'), async (req, res) => {
      const { adminId, clientId } = req.body;
      try {
        const admin = await User.findById(adminId);
        const client = await Client.findById(clientId);
    
        if (!admin || !client) return res.status(404).json({ message: 'Admin or Client not found' });
    
        if (!admin.assignedClients.includes(clientId)) {
          admin.assignedClients.push(clientId);
          await admin.save();
        }
    
        if (!client.assignedAdmins.includes(adminId)) {
          client.assignedAdmins.push(adminId);
          await client.save();
        }
    
        res.json({ message: 'Client assigned to admin successfully ✅' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
      }
    });

router.put(
          '/posts/:clientId/:postId',
          authenticateJWT,
          checkPermission('edit_post'),
          checkClientAssignment(),
          async (req, res) => {
            // Update logic
          }
        );
