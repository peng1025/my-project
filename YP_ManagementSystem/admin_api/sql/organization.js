module.exports = {

    addOrganization: " INSERT INTO t_organization(Name,ParentID,CreateTime,CreateBy,Deflag,Level,`Index`,Description) VALUES({Name},{ParentID},{CreateTime},{CreateBy},{Deflag},{Level},0,{Description});update t_organization set `index` = ID where ID=LAST_INSERT_ID()  ",
    updateOrganization: " update t_organization set Name={Name},ParentID={ParentID},Level={Level},Description={Description} where ID={ID}",
    deleteOrganization: " update t_organization set Deflag = 1 where ID in (?) ",
    getAllOrganization: "select ID,Name,Description,ParentID,Level,CreateTime,CreateBy,Deflag from t_organization where Deflag=0 ",
    getChildOrganizationByID: "select ID,Name,Description,ParentID,Level,CreateTime,CreateBy,Deflag from t_organization where ParentID=? and  Deflag=0 ",
    getOrganizationByID: "select ID,Name,Description,ParentID,Level,CreateTime,CreateBy,Deflag from t_organization where ID=? and  Deflag=0 "
}