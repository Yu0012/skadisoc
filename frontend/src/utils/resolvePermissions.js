import rolePermissions from './rolePermissions';
import roleTypePermissions from './roleTypePermissions';

const getAllUniqueItems = (type) => {
  const items = new Set();
  Object.values(rolePermissions).forEach(role => {
    (role[type] || []).forEach(item => items.add(item));
  });
  Object.values(roleTypePermissions).forEach(roleType => {
    (roleType[type] || []).forEach(item => items.add(item));
  });
  return [...items];
};

export const resolvePermissions = (permissions, role, roleType) => {
  const allMenus = permissions.menus.includes('*') ? getAllUniqueItems('menus') : permissions.menus;
  const allActions = permissions.actions.includes('*') ? getAllUniqueItems('actions') : permissions.actions;

  const allowedMenusByRoleType = roleTypePermissions[roleType]?.menus || [];
  const allowedActionsByRole = rolePermissions[role]?.actions || [];

  const resolvedMenus =
    roleType === 'superadmin'
      ? allMenus
      : allMenus.filter(menu => allowedMenusByRoleType.includes(menu));

  const resolvedActions =
    role === 'admin'
      ? allActions
      : allActions.filter(action => allowedActionsByRole.includes(action));

  return {
    menus: resolvedMenus,
    actions: resolvedActions,
  };
};
