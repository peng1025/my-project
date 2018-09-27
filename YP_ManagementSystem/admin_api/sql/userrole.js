module.exports = {
    setUserRole: " INSERT INTO t_user_role (UserID,RoleID,CreateTime,CreateBy) VALUES ? ",
    deleteRoleByUserID: " delete from t_user_role where UserID = ?  ",
    deleteRoleByRoleID: " delete from t_user_role where RoleID in (?) ",
    deleteUserRoleByRoleIDs: " delete from t_user_role where RoleID in (?) and UserID=?",
    getRoleByUserID: "select r.ID,r.Name,r.CreateBy,r.CreateTIme,r.Description,r.Deflag from t_user_role ur left join t_role r on ur.RoleID=r.ID where ur.UserID=? "
}