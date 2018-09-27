module.exports = {

    addRole: " INSERT INTO t_role(Name,CreateBy,CreateTIme,Description,Deflag) VALUES({Name},{CreateBy},{CreateTime},{Description},0) ",
    getRoleByName:"select ID,Name,CreateBy,CreateTIme,Description,Deflag from  t_role where Name= ? ",
    updateRole: " update t_role set Name={Name},CreateBy={CreateBy},Description={Description} where deflag=0 and ID={ID} ",
    deleteRole: " delete from t_role  where ID in ( ? )",
    getAllRole: " select ID,Name,CreateBy,CreateTime,Description from t_role where deflag=0  ",
    getRoleByID:" select ID,Name,CreateBy,CreateTime,Description from t_role where deflag=0 and ID= ? "
}