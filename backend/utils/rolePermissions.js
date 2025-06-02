const rolePermissions = {
  admin: {
    actions: ['create_user', 'read_user', 'update_user', 'delete_user', 'create_post', 'read_post', 'update_post', 'delete_post', 'assign_clients'],
  },
  editor: {
    actions: ['create_post', 'read_post', 'update_post', 'delete_post'],
  },
  viewer: {
    actions: ['read_post'],
  },
};

module.exports = rolePermissions;

//actions still not completed