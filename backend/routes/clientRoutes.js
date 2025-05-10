const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// CRUD for Clients
router.post('/', authenticateJWT, clientController.createClient);
router.get('/', authenticateJWT, clientController.getClients);
router.put('/:id', authenticateJWT, clientController.updateClient);
router.delete('/:id', authenticateJWT, clientController.deleteClient);

// Assign Admin to Client
router.post('/assign', authenticateJWT, clientController.assignAdminToClient);
// Unassign Client from User
router.post('/unassign', authenticateJWT, clientController.unassignClientFromUser);

module.exports = router;
