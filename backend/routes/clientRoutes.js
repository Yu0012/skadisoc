const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Assign & Unassign editor to client
// Single assignment routes
router.post('/:platform/assign/:clientId/:userId', authenticateJWT, clientController.assignUserToClient);
router.delete('/:platform/unassign/:clientId/:userId', authenticateJWT, clientController.unassignUserFromClient);

// Multiple assignment routes
router.post('/:platform/assign-multiple/:userId', authenticateJWT, clientController.assignMultipleClientsToUser);
router.post('/:platform/unassign-multiple/:userId', authenticateJWT, clientController.unassignMultipleClientsFromUser);

// Get all clients (filtered by permissions)
router.get('/:platform/all', authenticateJWT, clientController.getAllClients);

// Get all unassigned clients (admin only)
router.get('/:platform/unassigned', authenticateJWT, clientController.getAllUnassignClients);

// Get all assigned clients (filtered by permissions)
router.get('/:platform/assigned', authenticateJWT, clientController.getAllAssignedClients);

// Delete a client
router.delete('/:platform/:clientId', authenticateJWT, clientController.deleteOneClient);


module.exports = router;
