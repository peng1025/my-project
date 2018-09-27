module.exports = {

    addOrgRole: " INSERT INTO t_org_role(orgID,roleID) VALUES ? ",
    getRoleByOrgID: " select  GROUP_CONCAT(RoleID) as RoleIDs from t_org_role where orgID = ? group by orgID",
    deleteRoleByOrgID: "delete from t_org_role where orgID = ? ",
    deleteRoleByRoleID: "delete from t_org_role where RoleID = ? "

}