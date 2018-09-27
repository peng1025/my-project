const router = require('koa-router')();
import { login, regist, signout, requestData, getCheckCode, getQrCode, sendSmsCheckCode } from '../control/account';
import { getAllPermission, getAllValidPermission, getChildPermissionByID, addPermission, updatePermission, updatePermissionStatus, getPermissionByUserID, deletePermissionByID } from '../control/permission';
import { setRolePermission, deleteRolePermission, getPermissionByRoleID } from '../control/rolepermission'
import { setUserRole, deleteUserRole, getRoleByUserID } from '../control/userrole'
import { addRole, updateRole, deleteRole, getAllRole, getRoleByID, addRoleWithPermission } from '../control/role';
import { getRoleByOrgID } from '../control/orgrole';
import { getAllOrganization, getChildOrganizationByID, addOrganization, updateOrganization, deleteOrganization } from '../control/organization';
import { addUser, getUserByID, deleteUserByID, updateUser, getUsersByPorgID, getUserByRoleID, updateOrgID, updateStatus, updatePassword, getAllUsersByPorgID } from '../control/user';
import { getDic } from '../control/sys'







router.post('/pub/login', login);//登录
router.post('/pub/signout', signout);//登出
router.post('/login/updatePassword', updatePassword);//修改密码
// router.post('/pub/sendSmsCheckCode', sendSmsCheckCode);//发送短信验证码
router.get('/pub/getCheckCode', getCheckCode);//获取验证码
router.get('/pub/getQrCode', getQrCode)//获取二维码
router.post('/pub/regist', regist);//注册

//organize
router.post('/api/organize/getAllRoles', getAllRole);
router.post('/api/organize/getChildOrganizationByID', getChildOrganizationByID);
router.post('/api/organize/getUsersByPorgID', getUsersByPorgID);
router.post('/api/organize/getRoleByOrgID', getRoleByOrgID);
router.post('/api/organize/addOrganization', addOrganization);
router.post('/api/organize/updateOrganization', updateOrganization);
router.post('/api/organize/deleteOrganization', deleteOrganization);
router.post('/api/organize/addUser', addUser);
router.post('/api/organize/updateUser', updateUser);
router.post('/api/organize/deleteUserByID', deleteUserByID);
router.post('/api/organize/updateStatus', updateStatus);
router.post('/api/organize/updateOrgID', updateOrgID);
router.post('/api/organize/setUserRole', setUserRole);


//permissionsManage
router.post('/api/permissionsManage/getChildPermissionbyid', getChildPermissionByID);
router.post('/api/permissionsManage/updatePermissionStatus', updatePermissionStatus);
router.post('/api/permissionsManage/deletePermissionByID', deletePermissionByID);
router.post('/api/permissionsManage/updatePermission', updatePermission);
router.post('/api/permissionsManage/addPermission', addPermission);
router.post('/api/permissionsManage/getAllPermission', getAllPermission);



//roleManage
router.post('/api/roleManage/getPermissionByRoleID', getPermissionByRoleID);
router.post('/api/roleManage/getAllValidPermission', getAllValidPermission);
router.post('/api/roleManage/addRole', addRole);
router.post('/api/roleManage/updateRole', updateRole);
router.post('/api/roleManage/addRoleWithPermission', addRoleWithPermission);
router.post('/api/roleManage/setRolePermission', setRolePermission);
router.post('/api/roleManage/deleteRole', deleteRole);
router.post('/api/roleManage/getAllRoles', getAllRole);


//userManage
router.post('/api/userManage/getRoleByOrgID', getRoleByOrgID);
router.post('/api/userManage/getChildOrganizationByID', getChildOrganizationByID);
router.post('/api/userManage/getAllRoles', getAllRole);
router.post('/api/userManage/getAllUsersByPorgID', getAllUsersByPorgID);
router.post('/api/userManage/addUser', addUser);
router.post('/api/userManage/updateStatus', updateStatus);
router.post('/api/userManage/setUserRole', setUserRole);
router.post('/api/userManage/updateOrgID', updateOrgID);
router.post('/api/userManage/updateUser', updateUser);
router.post('/api/userManage/deleteUserByID', deleteUserByID);

//字典查询接口 
router.post('/login/getDic', getDic);//字典查询


//暂时未用到的接口
//router.get('/api/exportUser', sessionExport);
//router.post('/api/userimport', UserImport)
//router.get('/api/requestdata', requestData);
//router.post('/api/userimageimport', UserImageImport);
router.post('/api/getAllOrganization', getAllOrganization);
router.post('/api/getAllPermissionTree', getAllPermission);
router.post('/api/getPermissionByUserID', getPermissionByUserID);
router.post('/api/deleteRolePermission', deleteRolePermission);
router.post('/api/deleteUserRole', deleteUserRole);
router.post('/api/getRoleByUserID', getRoleByUserID);
router.post('/api/getRoleByID', getRoleByID);
router.post('/api/getAllPermissions', getAllPermission);
router.post('/api/getUserByID', getUserByID);
router.post('/api/getUserByRoleID', getUserByRoleID);










module.exports = router;