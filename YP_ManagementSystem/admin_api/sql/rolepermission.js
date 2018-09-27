module.exports = {
    setRolePermission: "INSERT INTO t_role_permission (RoleID, PermissionID,CreateTime,CreateBy) VALUES ? ",
    deletePermissionByRoleID: " delete from t_role_permission where RoleID= ? ",
    deletePermissionByPermissionIDs: " delete from  t_role_permission where PermissionID in (?)",
    getPermissionByRoleID: "select p.ID,p.Name,p.ParentID,p.Url,p.Type,p.CreateTime,p.CreateBy,p.Deflag,p.Level,p.Index,p.Description from t_role_permission rp  left join t_permission p on rp.PermissionID=p.ID where rp.RoleID= ? "
}