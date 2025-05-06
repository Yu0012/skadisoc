const roleTypePermissions = {
  superadmin: {
      menus: ['dashboard', 'posts', 'calendar', 'client', 'account'],
    },
  admin: {
      menus: ['dashboard', 'posts', 'calendar', 'client'],
    },// can't access account
  user: {
      menus: ['dashboard', 'posts', 'calendar'],
    }, // can't access client or account
};

module.exports = roleTypePermissions;
