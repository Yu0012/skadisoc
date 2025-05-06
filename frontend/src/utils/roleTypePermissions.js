const roleTypePermissions = {
    superadmin: {
      menus: ['dashboard', 'posts', 'calendar', 'client', 'account'],
    },
    admin: {
      menus: ['dashboard', 'posts', 'calendar', 'client'],
    },
    user: {
      menus: ['dashboard', 'posts', 'calendar'],
    },
  };
  
  export default roleTypePermissions;
  