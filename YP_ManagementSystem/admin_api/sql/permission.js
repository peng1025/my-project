module.exports = {

    getAllPermission: "select ID,Name,ParentID,Url,Type,CreateTime,CreateBy,Level,`Index` from t_permission ",
    getAllValidPermission: "select ID,Name,ParentID,Url,Type,CreateTime,CreateBy,Level,`Index` from t_permission ",
    getSimpleAllValidPermission: "select ID,Name,ParentID,Url,Type from t_permission ",
    getChildPermissionByID: "select a.ID,a.`Name`,a.ParentID,a.Url,a.Type,a.CreateTime,a.CreateBy,a.Deflag,a.Level,a.`Index`,a.Description,b.`Name` as ParentName from t_permission a left join t_permission b on a.ParentID=b.ID  where a.ParentID=? ",
    getChildPermissionByPage: "select a.ID,a.`Name`,a.ParentID,a.Url,a.Type,a.CreateTime,a.CreateBy,a.Deflag,a.Level,a.`Index`,a.Description,b.`Name` as ParentName from t_permission a left join t_permission b on a.ParentID=b.ID  where a.ID in (?)    limit ?,? ;select count(1) as count from t_permission a left join t_permission b on a.ParentID=b.ID  where a.ID in (?)",
    getPermissionByID: "select a.ID,a.`Name`,a.ParentID,a.Url,a.Type,a.CreateTime,a.CreateBy,a.Deflag,a.Level,a.`Index`,a.Description,b.`Name` as ParentName from t_permission a left join t_permission b on a.ParentID=b.ID where a.ID=? ",
    getPermissionByName: "select  ID,Name,ParentID,Url,Type,CreateTime,CreateBy,Level,`Index` from t_permission where Name=?",
    addPermission: " INSERT INTO t_permission(Name,ParentID,Url,Type,CreateTime,CreateBy,Deflag,Level,`Index`,Description) VALUES({Name},{ParentID},{Url},{Type},{CreateTime},{CreateBy},{Deflag},{Level},0,{Description});update t_permission set `index` = ID where ID=LAST_INSERT_ID()  ",
    updatePermission: " update t_permission set Name={Name},ParentID={ParentID},Url={Url},Type={Type},CreateTime={CreateTime},CreateBy={CreateBy},Deflag={Deflag},Level={Level},Description={Description} where ID={ID} ",
    updatePermissionStatus: " update t_permission set Deflag = ? where ID in (?)",
    getPermissionByUserID: "select DISTINCT p.ID,p.Name,p.ParentID,p.Url,p.Type,p.CreateTime,p.CreateBy,p.Deflag,p.Level,p.Index,p.Description from t_permission p    left join t_role_permission rp on p.ID=rp.PermissionID    left join t_user_role ur on ur.RoleID=rp.RoleID    left join t_user u on u.ID=ur.UserID    where u.ID= ? and p.deflag=0 ",
    getSimplePermissionByUserID: "select DISTINCT p.ID,p.Name,p.ParentID,p.Url,p.Type,p.Deflag from t_user u left join t_user_role ur on u.ID=ur.UserID left join t_role_permission rp on ur.RoleID=rp.RoleID left join t_permission p on p.ID=rp.PermissionID    where p.deflag=0 and u.ID= ? ",
    getPermissionByUrl: " select ID,Name,ParentID,Url,Type,CreateTime,CreateBy,Deflag,Level,`Index` from t_permission where Url={Url} and  Deflag=0 ",
    deletePermissionByID: " delete from t_permission where ID in ( ? ) ",
    getPermissionByIDs: "select ID,Name,ParentID,Url,Type,CreateTime,CreateBy,Level,`Index` from t_permission where ID in (?)"


}