// const Client = require('../models/Client');

// const checkClientAssignment = () => {
//   return async (req, res, next) => {
//     const user = req.user;
//     const clientId = req.params.clientId || req.body.clientId;

//     if (user.roleType === 'superadmin') return next(); // Superadmin can access all

//     const isAssigned = user.assignedClients.includes(clientId);
//     if (!isAssigned) return res.status(403).json({ message: 'Access denied: not assigned to this client' });

//     next();
//   };
// };

// module.exports = checkClientAssignment;
