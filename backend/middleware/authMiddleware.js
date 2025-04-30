const passport = require('passport');
const { resolvePermissions } = require('../utils/resolvePermissions');

const authenticateJWT = passport.authenticate('jwt', { session: false });

// Check if user has required permission
const checkPermission = (requiredAction) => {
  return (req, res, next) => {
    const { role, roleType, permissions } = req.user;
    const resolved = resolvePermissions(permissions, role, roleType);

    const hasPermission =
      resolved.actions.includes('*') || resolved.actions.includes(requiredAction);

    console.log(`🔒 Checking permission for action: ${requiredAction}`);
    console.log(`👤 Resolved permissions:`, resolved.actions);

    if (!hasPermission) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    next();
  };
};

const checkRole = (role) => {
  return (req, res, next) => {
    console.log(`🔎 Role check: expecting ${role}, got ${req.user.roleType}`);
    if (req.user.roleType !== role) {
      return res.status(403).json({ message: 'Access denied: wrong role' });
    }
    next();
  };
};

module.exports = {
  authenticateJWT,
  checkPermission,
  checkRole,
};
