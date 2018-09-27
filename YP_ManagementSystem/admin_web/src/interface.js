export default {
  /**----------------------公用接口start----------------------*/
  '查询字典': {
    url: '/login/getDic', method: 'post', params: {}
  },
  /**----------------------公用接口end----------------------*/
  /**----------------------基本权限接口start----------------------*/
  /**----------------------登录页接口start----------------------*/
  '登录': {
    url: '/pub/login', method: 'post', params: {}
  },
  /**----------------------登录页接口end----------------------*/
  /**----------------------首页接口start----------------------*/
  '登出': {
    url: '/pub/signout', method: 'post', params: {}
  },
  '修改密码': {
    url: '/login/updatePassword', method: 'post', params: {}
  },
  /**----------------------首页接口end----------------------*/
  /**----------------------组织管理页接口start----------------------*/
  '组织列表': {
    url: '/api/organize/getChildOrganizationByID', method: 'post', params: {}
  },
  '角色列表': {
    url: '/api/organize/getAllRoles', method: 'post', params: {}
  },
  '组织用户列表': {
    url: '/api/organize/getUsersByPorgID', method: 'post', params: {}
  },
  '删除组织': {
    url: '/api/organize/deleteOrganization', method: 'post', params: {}
  },
  '添加组织': {
    url: '/api/organize/addOrganization', method: 'post', params: {}
  },
  '编辑组织': {
    url: '/api/organize/updateOrganization', method: 'post', params: {}
  },
  '默认角色': {
    url: '/api/organize/getRoleByOrgID', method: 'post', params: {}
  },
  '添加用户': {
    url: '/api/organize/addUser', method: 'post', params: {}
  },
  '编辑用户': {
    url: '/api/organize/updateUser', method: 'post', params: {}
  },
  '删除用户': {
    url: '/api/organize/deleteUserByID', method: 'post', params: {}
  },
  '变更用户状态': {
    url: '/api/organize/updateStatus', method: 'post', params: {}
  },
  '变更用户组织': {
    url: '/api/organize/updateOrgID', method: 'post', params: {}
  },
  '设置角色': {
    url: '/api/organize/setUserRole', method: 'post', params: {}
  },
  /**----------------------组织管理页接口end----------------------*/
  /**----------------------权限管理页接口start----------------------*/
  '当前权限及其子权限列表': {
    url: '/api/permissionsManage/getChildPermissionbyid', method: 'post', params: {}
  },
  '权限生效及失效': {
    url: '/api/permissionsManage/updatePermissionStatus', method: 'post', params: {}
  },
  '添加权限': {
    url: '/api/permissionsManage/addPermission', method: 'post', params: {}
  },
  '编辑权限': {
    url: '/api/permissionsManage/updatePermission', method: 'post', params: {}
  },
  '删除权限': {
    url: '/api/permissionsManage/deletepermissionByid', method: 'post', params: {}
  },
  '权限列表': {
    url: '/api/permissionsManage/getAllPermission', method: 'post', params: {}
  },
  /**----------------------权限管理页接口end----------------------*/
  /**----------------------角色管理页接口start----------------------*/
  '添加角色': {
    url: '/api/roleManage/addRole', method: 'post', params: {}
  },
  '编辑角色': {
    url: '/api/roleManage/updateRole', method: 'post', params: {}
  },
  '删除角色': {
    url: '/api/roleManage/deleteRole', method: 'post', params: {}
  },
  '角色页角色列表': {
    url: '/api/roleManage/getAllRoles', method: 'post', params: {}
  },
  '角色权限': {
    url: '/api/roleManage/getPermissionByRoleID', method: 'post', params: {}
  },
  '获取有效权限': {
    url: '/api/roleManage/getAllValidPermission', method: 'post', params: {}
  },
  '添加角色及授权': {
    url: '/api/roleManage/addRoleWithPermission', method: 'post', params: {}
  },
  '角色授权': {
    url: '/api/roleManage/setRolePermission', method: 'post', params: {}
  },
  /**----------------------角色管理页接口end----------------------*/
  /**----------------------用户管理页接口start----------------------*/
  '用户页默认角色': {
    url: '/api/userManage/getRoleByOrgID', method: 'post', params: {}
  },
  '用户页组织列表': {
    url: '/api/userManage/getChildOrganizationByID', method: 'post', params: {}
  },
  '用户页角色列表': {
    url: '/api/userManage/getAllRoles', method: 'post', params: {}
  },
  '用户列表': {
    url: '/api/userManage/getAllUsersByPorgID', method: 'post', params: {}
  },
  '用户页添加用户': {
    url: '/api/userManage/addUser', method: 'post', params: {}
  },
  '用户页编辑用户': {
    url: '/api/userManage/updateUser', method: 'post', params: {}
  },
  '用户页删除用户': {
    url: '/api/userManage/deleteUserByID', method: 'post', params: {}
  },
  '用户页变更用户状态': {
    url: '/api/userManage/updateStatus', method: 'post', params: {}
  },
  '用户页变更用户组织': {
    url: '/api/userManage/updateOrgID', method: 'post', params: {}
  },
  '用户页设置角色': {
    url: '/api/userManage/setUserRole', method: 'post', params: {}
  },
  /**----------------------用户管理页接口end----------------------*/
  /**----------------------基本权限接口end----------------------*/
};