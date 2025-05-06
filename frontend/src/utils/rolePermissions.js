const rolePermissions = {
    admin: {
      actions: ['create_post', 'delete_post', 'manage_users'],
    },
    editor: {
      actions: ['create_post', 'edit_post'],
    },
    viewer: {
      actions: ['view_post'],
    },
  };
  
  export default rolePermissions;
  