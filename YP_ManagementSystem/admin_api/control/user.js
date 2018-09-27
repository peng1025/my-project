const query = require('../middler/mysql');
const logger = require('../middler/logger');
const sql = require('../sql/user');
const sqlUserRole = require('../sql/userrole');
const sqlOrganization = require('../sql/organization')
const tool = require('../middler/tool');
var uuid = require('../middler/uuid');
import moment from "moment";
const org = require('./organization');


exports.addUser = async function (ctx, next) {
    try {

        let name = ctx.request.body.name;
        let username = ctx.request.body.username;
        let password = ctx.request.body.username;
        let jobno = ctx.request.body.jobno;
        let status = ctx.request.body.status;
        let type = ctx.request.body.type;
        let ismanage = ctx.request.body.type;
        let orgid = ctx.request.body.orgid;
        let CreateBy = ctx.session.userName;
        let roles = ctx.request.body.roles;

        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(name)) {
            paramsSuc = false;
            msg = "用户姓名不能为空";
        } else if (!tool.isValid(username)) {
            paramsSuc = false;
            msg = "登录名不能为空";
        } else if (!tool.isValid(password)) {
            paramsSuc = false;
            msg = "密码不能为空";
        } else if (!tool.isValid(jobno)) {
            paramsSuc = false;
            msg = "工号不能为空";
        } else if (!tool.isValid(status)) {
            paramsSuc = false;
            msg = "用户状态不能为空";
        } else if (!tool.isValid(type)) {
            paramsSuc = false;
            msg = "用户类型不能为空";
        } else if (!tool.isValid(orgid)) {
            paramsSuc = false;
            msg = "组织ID不能为空";
        }

        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let userResult = await query.query(sql.getUserByUserName, username);
        if (userResult.code && userResult.result.length > 0) {
            ctx.body = {
                code: 400,
                msg: "登录名已存在"
            };
            return;
        }
        let jobnoResult = await query.query(sql.getUserByJobNO, jobno);
        if (jobnoResult.code && jobnoResult.result.length > 0) {
            ctx.body = {
                code: 400,
                msg: "工号已存在"
            };
            return;
        }
        let uuidStr = uuid.v4().replace(/-/g, '')
        let result = await query.query(sql.addUser, {
            ID: uuidStr,
            Name: name,
            UserName: username,
            Password: tool.md5(password),
            JobNO: jobno,
            OrgID: orgid,
            Status: status.toString(),
            IsManage: type.toString(),
            CreateTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            CreateBy: CreateBy,
            Deflag: "0"
        });
        if (result.code) {
            if (roles && roles.length > 0) {
                let values = [];
                let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
                for (var ele of roles) {
                    values.push([uuidStr, ele, time, ctx.session.userName]);
                }
                let setUserRoleResult = await query.query(sqlUserRole.setUserRole, [values]);

            }

        }
        //  logger.Info('api/getallpermission：' + JSON.stringify(result), "control");
        if (result.code && result.result.affectedRows > 0) {
            tool.rectx(ctx, 200, "添加成功");
            // ctx.body = {
            //     code: 200,
            //     msg: ""
            // };
        } else {
            ctx.body = {
                code: 400,
                msg: result.message || "添加失败"
            };
        }
        return;
    } catch (e) {
        logger.Error('/user/addUser异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            message: e.message
        };
    }

}
exports.updatePassword = async function (ctx, next) {
    try {
        var id = ctx.request.body.id;
        var password = ctx.request.body.password;
        var oldpassword = ctx.request.body.oldpassword;
        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(id)) {
            paramsSuc = false;
            msg = "用户ID不能为空";
        } else if (!tool.isValid(password)) {
            paramsSuc = false;
            msg = "密码不能为空";
        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let result = await query.query(sql.getUserByID, [id]);
        if (result.code && result.result.length) {
            if (tool.md5(oldpassword) != result.result[0].Password) {
                ctx.body = {
                    code: 400,
                    msg: "旧密码错误"
                };
                return;

            }

        } else {
            ctx.body = {
                code: 400,
                msg: "用户不存在"
            };
            return;
        }
        result = await query.query(sql.updatePassword, [tool.md5(password), id]);
        if (result.code && result.result.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: ""
            };
        } else {
            ctx.body = {
                code: 400,
                msg: result.message || "更改失败"
            };
        }
        return;

    }
    catch (e) {
        logger.Error('/user/updatePassword异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            message: e.message
        };
    }

}
exports.getUserByID = async function (ctx, next) {
    try {
        var id = ctx.request.body.id;
        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(id)) {
            paramsSuc = false;
            msg = "用户ID不能为空";
        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let result = await query.query(sql.getUserByID, [id]);

        ctx.body = {
            code: 200,
            msg: "",
            data: result.result
        }
        return
    } catch (e) {
        logger.Error('/user/getUserByID异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            message: e.message
        };
    }

}

exports.updateOrgID = async function (ctx, next) {
    try {
        var orgid = ctx.request.body.orgid;
        var uids = ctx.request.body.uids;
        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(orgid)) {
            paramsSuc = false;
            msg = "组织ID不能为空";
        } else if ((!tool.isValid(uids)) && uids.length <= 0) {
            paramsSuc = false;
            msg = "用户ID不能为空";
        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let result = await query.query(sql.updateOrgID, [orgid, uids]);
        if (result.code && result.result.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: ""
            };
        } else {
            ctx.body = {
                code: 400,
                msg: result.message || "更改失败"
            };
        }
        return;
    } catch (e) {
        logger.Error('/user/updateOrgID异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            message: e.message
        };
    }

}


exports.updateStatus = async function (ctx, next) {
    try {
        var status = ctx.request.body.status;
        var uids = ctx.request.body.uids;
        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(status)) {
            paramsSuc = false;
            msg = "组织ID不能为空";
        } else if ((!tool.isValid(uids)) && uids.length <= 0) {
            paramsSuc = false;
            msg = "用户ID不能为空";
        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let result = await query.query(sql.updateStatus, [status, uids]);
        if (result.code && result.result.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: ""
            };
        } else {
            ctx.body = {
                code: 400,
                msg: result.message || "更改失败"
            };
        }
        return;
    } catch (e) {
        logger.Error('/user/updateStatus异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            message: e.message
        };
    }

}



exports.deleteUserByID = async function (ctx, next) {
    try {
        var ids = ctx.request.body.ids;
        let paramsSuc = true;
        let msg = '';
        if ((!tool.isValid(ids)) && ids.length <= 0) {
            paramsSuc = false;
            msg = "用户ID不能为空";
        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let result = await query.query(sql.deleteUserByID, [ids]);
        if (result.code && result.result.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: ""
            };
        } else {
            ctx.body = {
                code: 400,
                msg: result.message || "删除失败"
            };
        }
        return;
    } catch (e) {
        logger.Error('/user/getUserByID异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            message: e.message
        };
    }
}

exports.updateUser = async function (ctx, next) {
    try {

        let id = ctx.request.body.id;
        let name = ctx.request.body.name;
        let status = ctx.request.body.status;
        let type = ctx.request.body.type;
        let orgid = ctx.request.body.orgid;
        let updateBy = ctx.session.userName;

        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(id)) {
            paramsSuc = false;
            msg = "用户ID不能为空";
        } else if (!tool.isValid(name)) {
            paramsSuc = false;
            msg = "用户姓名不能为空";
        } else if (!tool.isValid(status)) {
            paramsSuc = false;
            msg = "用户状态不能为空";
        } else if (!tool.isValid(type)) {
            paramsSuc = false;
            msg = "用户类型不能为空";
        } else if (!tool.isValid(orgid)) {
            paramsSuc = false;
            msg = "组织ID不能为空";
        }

        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }

        let result = await query.query(sql.updateUser, {
            ID: id,
            Name: name,
            OrgID: orgid,
            Status: status.toString(),
            IsManage: type.toString(),
            UpdateTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            UpdateBy: updateBy,
            Deflag: "0"
        });

        //  logger.Info('api/getallpermission：' + JSON.stringify(result), "control");
        if (result.code && result.result.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: ""
            };
        } else {
            ctx.body = {
                code: 400,
                msg: result.message || "修改失败"
            };
        }
        return;
    } catch (e) {
        logger.Error('/user/addUser异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}
// exports.getAllUsersByPorgID = async function (ctx, next) {
//     try {
//         let orgList = [];
//         if (!ctx.session.orgList) {
//             let result = await query.query(sqlOrganization.getOrganizationByID, [ctx.session.orgId]);
//             orgList.push(result.result[0]);
//             await org.getChildNode(ctx.session.orgId, orgList)
//             ctx.session.orgList = orgList;
//         } else {
//             orgList = ctx.session.orgList;
//         }
//         let orgid = ctx.request.body.orgid;
//         let name = ctx.request.body.name;
//         let username = ctx.request.body.username;
//         let jobno = ctx.request.body.jobno;
//         let status = ctx.request.body.status;
//         let ismanage = ctx.request.body.ismanage;
//         let start = ctx.request.body.start;
//         let size = ctx.request.body.size;
//         let paramsSuc = true;
//         let msg = '';
//         let isExist = false;
//         for (var temp of orgList) {
//             if (temp.ID == orgid) {
//                 isExist = true;
//                 break;
//             }
//         }
//         if (!isExist) {
//             paramsSuc = false;
//             msg = "组织未包含在当前用户可访问的组织中";
//         } else if (!tool.isValid(orgid)) {
//             paramsSuc = false;
//             msg = "组织ID不能为空";
//         } else if (!tool.isValid(start)) {
//             paramsSuc = false;
//             msg = "start不能为空";
//         } else if (!tool.isValid(size)) {
//             paramsSuc = false;
//             msg = "size不能为空";
//         } else if (!(tool.isRealNum(start) && tool.isRealNum(size))) {
//             paramsSuc = false;
//             msg = "start&size必须为数字";
//         } else if (size > 100) {
//             paramsSuc = false;
//             msg = "size超过查询上限";

//         }
//         if (!paramsSuc) {
//             ctx.body = {
//                 code: 400,
//                 msg: msg
//             };
//             return;
//         }
//         let orgIdList = [orgid];
//         getChildrenOrgIdList(orgid, orgList, orgIdList);

//         // let orgList = [];
//         // if (orgid != 1) {

//         //     let orgObj = [];
//         //     orgList.push(orgid);
//         //     await org.getChildNode(orgid, orgList)
//         //     orgObj.map(function (obj) {
//         //         orgList.push(obj.ID);
//         //     })
//         // }
//         var selectsql = " select u.ID,max(u.`Name`) as Name, max(u.UserName) as UserName, max(u.OrgID) as OrgID, max(u.LastLoginTime ) as LastLoginTime, max(u.Mobile ) as Mobile,max(u.IsManage ) as IsManage, max(u.LoginCount ) as LoginCount, max(u.CreateTime ) as CreateTime, max(u.CreateBy ) as CreateBy,max(u.Deflag ) as Deflag, max(u.Status ) as Status, max(u.JobNO ) as JobNO, max(u.UpdateTime ) as UpdateTime, max(u.UpdateBy ) as UpdateBy,  GROUP_CONCAT(r.`Name`)as RoleNames,GROUP_CONCAT(r.ID) as RoleIds , max(o.`Name`) as OrgName from t_user u left join t_organization o on u.OrgID=o.ID  left join t_user_role ur on u.ID=ur.UserID left join t_role r on ur.RoleID= r.ID "
//         var param = [];
//         var conditionssql = " where u.Deflag=0 ";
//         if (orgid != 1) {
//             conditionssql += tool.getConditionString(conditionssql, "u.orgid in (", " ? )");
//             param.push(orgIdList);
//         }
//         if (tool.isValid(name)) {
//             conditionssql += tool.getConditionString(conditionssql, "u.name=", "  ? ");
//             param.push(name);
//         }
//         if (tool.isValid(ismanage)) {
//             conditionssql += tool.getConditionString(conditionssql, "u.ismanage=", "  ? ");
//             param.push(ismanage);
//         }
//         if (tool.isValid(username)) {
//             conditionssql += tool.getConditionString(conditionssql, "u.username=", "  ?  ");
//             param.push(username);
//         }
//         if (tool.isValid(jobno)) {
//             conditionssql += tool.getConditionString(conditionssql, "u.jobno=", "  ?  ");
//             param.push(jobno);
//         }
//         if (tool.isValid(status)) {
//             conditionssql += tool.getConditionString(conditionssql, "u.status=", "  ?  ");
//             param.push(status);
//         }
//         var groupsql = " GROUP BY u.ID order by u.CreateTime limit ?,?"
//         var countsql = "select count(1) as count from (select count(1) as count from t_user u left join t_organization o on u.OrgID=o.ID  left join t_user_role ur on u.ID=ur.UserID left join t_role r on ur.RoleID= r.ID " + conditionssql + "  GROUP BY u.ID )t "
//         param.push(start);
//         param.push(size);
//         var sql = selectsql + conditionssql + groupsql;

//         let result = await query.query(sql, param);

//         let countResult = await query.query(countsql, param);

//         ctx.body = {
//             code: 200,
//             msg: "",
//             data: {
//                 result: result.result,
//                 count: countResult.result[0].count
//             }
//         }
//         return
//     } catch (e) {
//         logger.Error('/user/getUserByRoleID异常：' + e.message, 'control');
//         ctx.body = {
//             code: 500,
//             msg: e.message
//         };
//     }

// }

exports.getAllUsersByPorgID = async function (ctx, next) {
    try {
        let orgList = [];
        if (!ctx.session.orgList) {
            let result = await query.query(sqlOrganization.getOrganizationByID, [ctx.session.orgId]);
            orgList.push(result.result[0]);
            await org.getChildNode(ctx.session.orgId, orgList)
            ctx.session.orgList = orgList;
        } else {
            orgList = ctx.session.orgList;
        }
        let orgid = ctx.request.body.orgid;
        let name = ctx.request.body.name;
        let username = ctx.request.body.username;
        let jobno = ctx.request.body.jobno;
        let status = ctx.request.body.status;
        let ismanage = ctx.request.body.ismanage;
        let start = ctx.request.body.start;
        let size = ctx.request.body.size;
        let paramsSuc = true;
        let msg = '';
        let isExist = false;
        for (var temp of orgList) {
            if (temp.ID == orgid) {
                isExist = true;
                break;
            }
        }
        if (!isExist) {
            paramsSuc = false;
            msg = "组织未包含在当前用户可访问的组织中";
        } else if (!tool.isValid(orgid)) {
            paramsSuc = false;
            msg = "组织ID不能为空";
        } else if (!tool.isValid(start)) {
            paramsSuc = false;
            msg = "start不能为空";
        } else if (!tool.isValid(size)) {
            paramsSuc = false;
            msg = "size不能为空";
        } else if (!(tool.isRealNum(start) && tool.isRealNum(size))) {
            paramsSuc = false;
            msg = "start&size必须为数字";
        } else if (size > 100) {
            paramsSuc = false;
            msg = "size超过查询上限";

        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let orgIdList = [orgid];
        getChildrenOrgIdList(orgid, orgList, orgIdList);

        var result = await query.query(sql.getAllUsersByPorgID, { orgid: orgIdList, name: name, username: username, jobno: jobno, status: status, ismanage: ismanage, start: start, size: size });
        ctx.body = {
            code: 200,
            msg: "",
            data: {
                result: result.result[0],
                count: result.result[1][0].count
            }
        }
        return
    } catch (e) {
        logger.Error('/user/getUserByRoleID异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }

}






function getChildrenOrgIdList(id, list, orgIdList) {
    let result = GetOrgIdsByParentId(id, list);
    if (result.length) {
        orgIdList.push.apply(orgIdList, result);
        for (let temp of result) {
            getChildrenOrgIdList(temp, list, orgIdList);
        }
    }
}
function GetOrgIdsByParentId(id, list) {
    let orgIds = [];
    for (let temp of list) {
        if (id == temp.ParentID) {
            orgIds.push(temp.ID)
        }
    }
    return orgIds;
}


// exports.getUsersByPorgID = async function (ctx, next) {
//     try {
//         let orgid = ctx.request.body.orgid;
//         let name = ctx.request.body.name;
//         let username = ctx.request.body.username;
//         let jobno = ctx.request.body.jobno;
//         let status = ctx.request.body.status;
//         let ismanage = ctx.request.body.ismanage;
//         let start = ctx.request.body.start;
//         let size = ctx.request.body.size;
//         let paramsSuc = true;
//         let msg = '';
//         if (!tool.isValid(orgid)) {
//             paramsSuc = false;
//             msg = "组织ID不能为空";
//         } else if (!tool.isValid(start)) {
//             paramsSuc = false;
//             msg = "start不能为空";
//         } else if (!tool.isValid(size)) {
//             paramsSuc = false;
//             msg = "size不能为空";
//         } else if (!(tool.isRealNum(start) && tool.isRealNum(size))) {
//             paramsSuc = false;
//             msg = "start&size必须为数字";
//         } else if (size > 100) {
//             paramsSuc = false;
//             msg = "size超过查询上限";

//         }
//         if (!paramsSuc) {
//             ctx.body = {
//                 code: 400,
//                 msg: msg
//             };
//             return;
//         }
//         let orgList = [];
//         let orgObj = [];
//         orgList.push(orgid);
//         await org.getChildNode(orgid, orgObj)
//         orgObj.map(function (obj) {
//             orgList.push(obj.ID);
//         })
//         var selectsql = " select u.ID,max(u.`Name`) as Name, max(u.UserName) as UserName, max(u.OrgID) as OrgID, max(u.LastLoginTime ) as LastLoginTime, max(u.Mobile ) as Mobile,max(u.IsManage ) as IsManage, max(u.LoginCount ) as LoginCount, max(u.CreateTime ) as CreateTime, max(u.CreateBy ) as CreateBy,max(u.Deflag ) as Deflag, max(u.Status ) as Status, max(u.JobNO ) as JobNO, max(u.UpdateTime ) as UpdateTime, max(u.UpdateBy ) as UpdateBy,  GROUP_CONCAT(r.`Name`)as RoleNames,GROUP_CONCAT(r.ID) as RoleIds , max(o.`Name`) as OrgName from t_user u left join t_organization o on u.OrgID=o.ID  left join t_user_role ur on u.ID=ur.UserID left join t_role r on ur.RoleID= r.ID "
//         var param = [];
//         var conditionssql = " where u.Deflag=0 and OrgID in (?)";
//         param.push(orgList.toString());

//         if (tool.isValid(orgid)) {
//             conditionssql += tool.getConditionString(conditionssql, "u.orgid=", " ? ");
//             param.push(orgid);
//         }
//         if (tool.isValid(name)) {
//             conditionssql += tool.getConditionString(conditionssql, "u.name=", "  ? ");
//             param.push(name);
//         }
//         if (tool.isValid(ismanage)) {
//             conditionssql += tool.getConditionString(conditionssql, "u.ismanage=", "  ? ");
//             param.push(ismanage);
//         }
//         if (tool.isValid(username)) {
//             conditionssql += tool.getConditionString(conditionssql, "u.username=", "  ?  ");
//             param.push(username);
//         }
//         if (tool.isValid(jobno)) {
//             conditionssql += tool.getConditionString(conditionssql, "u.jobno=", "  ?  ");
//             param.push(jobno);
//         }
//         if (tool.isValid(status)) {
//             conditionssql += tool.getConditionString(conditionssql, "u.status=", "  ?  ");
//             param.push(status);
//         }
//         var groupsql = " GROUP BY u.ID limit ?,?"
//         var countsql = "select count(1) as count from (select count(1) as count from t_user u left join t_organization o on u.OrgID=o.ID  left join t_user_role ur on u.ID=ur.UserID left join t_role r on ur.RoleID= r.ID " + conditionssql + "  GROUP BY u.ID )t "
//         param.push(start);
//         param.push(size);
//         var sql = selectsql + conditionssql + groupsql;

//         let result = await query.query(sql, param);

//         let countResult = await query.query(countsql, param);

//         ctx.body = {
//             code: 200,
//             msg: "",
//             data: {
//                 result: result.result,
//                 count: countResult.result[0].count
//             }
//         }
//         return
//     } catch (e) {
//         logger.Error('/user/getUserByRoleID异常：' + e.message, 'control');
//         ctx.body = {
//             code: 500,
//             msg: e.message
//         };
//     }

// }


exports.getUsersByPorgID = async function (ctx, next) {
    try {
        let orgList = [];
        if (!ctx.session.orgList) {
            let result = await query.query(sqlOrganization.getOrganizationByID, [ctx.session.orgId]);
            orgList.push(result.result[0]);
            await org.getChildNode(ctx.session.orgId, orgList)
            ctx.session.orgList = orgList;
        } else {
            orgList = ctx.session.orgList;
        }
        let orgid = ctx.request.body.orgid;
        let name = ctx.request.body.name;
        let username = ctx.request.body.username;
        let jobno = ctx.request.body.jobno;
        let status = ctx.request.body.status;
        let ismanage = ctx.request.body.ismanage;
        let start = ctx.request.body.start;
        let size = ctx.request.body.size;
        let paramsSuc = true;
        let msg = '';
        let isExist = false;
        for (var temp of orgList) {
            if (temp.ID == orgid) {
                isExist = true;
                break;
            }
        }
        if (!isExist) {
            paramsSuc = false;
            msg = "组织未包含在当前用户可访问的组织中";
        } else if (!tool.isValid(orgid)) {
            paramsSuc = false;
            msg = "组织ID不能为空";
        } else if (!tool.isValid(start)) {
            paramsSuc = false;
            msg = "start不能为空";
        } else if (!tool.isValid(size)) {
            paramsSuc = false;
            msg = "size不能为空";
        } else if (!(tool.isRealNum(start) && tool.isRealNum(size))) {
            paramsSuc = false;
            msg = "start&size必须为数字";
        } else if (size > 100) {
            paramsSuc = false;
            msg = "size超过查询上限";

        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        // let orgIdList = [orgid];
        // getChildrenOrgIdList(orgid, orgList, orgIdList);

        var result = await query.query(sql.getAllUsersByPorgID, { orgid: orgid, name: name, username: username, jobno: jobno, status: status, ismanage: ismanage, start: start, size: size });
        ctx.body = {
            code: 200,
            msg: "",
            data: {
                result: result.result[0],
                count: result.result[1][0].count
            }
        }
        return
    } catch (e) {
        logger.Error('/user/getUserByRoleID异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }

}
// exports.getUsersByPorgID = async function (ctx, next) {
//     try {
//         var id = ctx.request.body.id;
//         let paramsSuc = true;
//         let msg = '';
//         if (!tool.isValid(id)) {
//             paramsSuc = false;
//             msg = "组织ID不能为空";
//         }
//         if (!paramsSuc) {
//             ctx.body = {
//                 code: 400,
//                 msg: msg
//             };
//             return;
//         }
//         let orgList = [];
//         let orgObj = [];
//         orgList.push(id);
//         await org.getChildNode(id, orgObj)
//         orgObj.map(function (obj) {
//             orgList.push(obj.ID);
//         })
//         let result = await query.query(sql.getUsersByPorgID,  [orgList.toString()] );
//         ctx.body = {
//             code: 200,
//             msg: "",
//             data: result.result
//         }
//         return
//     } catch (e) {
//         logger.Error('api/getUsersByPorgID异常：' + e.message, 'control');
//         ctx.body = {
//             code: 500,
//             msg: e.message
//         };
//     }
// }

exports.getUserByRoleID = async function (ctx, next) {
    try {
        var id = ctx.request.body.id;
        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(id)) {
            paramsSuc = false;
            msg = "角色ID不能为空";
        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let result = await query.query(sql.getUserByRoleID, [id]);
        ctx.body = {
            code: 200,
            msg: "",
            data: result.result
        }
        return
    } catch (e) {
        logger.Error('/user/getUserByRoleID异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}