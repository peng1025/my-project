const query = require('../middler/mysql');
const logger = require('../middler/logger');
const sql = require('../sql/organization');
const sqlOrgRole = require('../sql/orgrole');
const sqlUser = require('../sql/user');
const tool = require('../middler/tool');
import moment from "moment";


exports.addOrganization = async function (ctx, next) {
    try {
        let parentid = ctx.request.body.parentid;
        let name = ctx.request.body.name;
        let description = ctx.request.body.description;
        let username = ctx.session.userName;
        let roles = ctx.request.body.roles;
        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(username)) {
            paramsSuc = false;
            msg = "登录名不能为空";
        }else if (!tool.isValid(parentid)) {
            paramsSuc = false;
            msg = "父ID不能为空";
        }else if (!tool.isValid(name)) {
            paramsSuc = false;
            msg = "组织名称不能为空";
        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let presult = await query.query(sql.getOrganizationByID, [parentid]);
        if (!presult.result.length) {
            ctx.body = {
                code: 400,
                msg: "父ID不存在"
            };
            return;
        }
        let trans = new query.Transaction();
        let r = await trans.start();
        let result = await trans.execute(sql.addOrganization, {
            Name: name,
            ParentID: parentid.toString(),
            CreateTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            CreateBy: username,
            Deflag: "0",
            Level: presult.result[0].Level + 1,
            Description: description
        });
        if (!result.code) {
            await trans.rollback();  //回滚
            ctx.body = {
                code: 400,
                msg: "添角角色失败"
            };
            return;
        }

        let values = [];
        if ((tool.isValid(roles)) && roles.length > 0) {
            for (var ele of roles) {
                values.push([result.result[0].insertId, ele]);
            }

            let sql2 = await trans.execute(sqlOrgRole.addOrgRole, [values])
            if (!sql2.code) {
                await trans.rollback();  //回滚
                ctx.body = {
                    code: 400,
                    msg: "添加默认角色失败"
                };
                return;
            }
        }
        await trans.commit();  //提交
        ctx.session.orgList = null;
        ctx.body = {
            code: 200,
            msg: "操作成功"
        };
        return;
    } catch (e) {
        logger.Error('/organization/addOrganization异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            message: e.message
        };
    }

}
exports.updateOrganization = async function (ctx, next) {
    try {
        let id = ctx.request.body.id;
        let parentid = ctx.request.body.parentid;
        let name = ctx.request.body.name;
        let description = ctx.request.body.description;
        let roles = ctx.request.body.roles;
        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(id)) {
            paramsSuc = false;
            msg = "ID不能为空";
        }else if (!tool.isValid(parentid)) {
            paramsSuc = false;
            msg = "父ID不能为空";
        }else if (!tool.isValid(name)) {
            paramsSuc = false;
            msg = "组织名称不能为空";
        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let plevel = 0;
        if (parentid != 0) {
            let presult = await query.query(sql.getOrganizationByID, [parentid]);
            if (!presult.result.length) {
                ctx.body = {
                    code: 400,
                    msg: "父ID不存在"
                };
                return;
            }
            plevel = presult.result[0].Level;
        }
        let trans = new query.Transaction();
        let r = await trans.start();
        let sql1 = await trans.execute(sql.updateOrganization, {
            ID: id,
            Name: name,
            ParentID: parentid.toString(),
            Level: plevel + 1,
            Description: description
        });
      
        if (!sql1.code) {
            await trans.rollback();  //回滚
            ctx.body = {
                code: 400,
                msg: "更新失败"
            };
            return;
        }

        let values = [];
        if ((tool.isValid(roles)) && roles.length > 0) {

            let sql2 = await trans.execute(sqlOrgRole.deleteRoleByOrgID, [id])
            if (!sql2.code) {
                await trans.rollback();  //回滚
                ctx.body = {
                    code: 400,
                    msg: "删除旧角色信息失败"
                };
                return;

            }
            for (var ele of roles) {
               
                values.push([id, ele]);
            }
          
            let sql3 = await trans.execute(sqlOrgRole.addOrgRole, [values])
            if (!sql3.code) {
                await trans.rollback();  //回滚
                ctx.body = {
                    code: 400,
                    msg: "添加新角色信息失败"
                };
                return;
            }
        }
        else {
            let sql2 = await trans.execute(sqlOrgRole.deleteRoleByOrgID, [id])
            if (!sql2.code) {
                await trans.rollback();  //回滚
                ctx.body = {
                    code: 400,
                    msg: "删除旧角色信息失败"
                };
                return;

            }
        }
        await trans.commit();  //提交
        ctx.body = {
            code: 200,
            msg: "操作成功"
        };
        return;
    } catch (e) {
        logger.Error('/organization/updateOrganization异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }

}

exports.deleteOrganization = async function (ctx, next) {
    try {
        var organizationlist = [];
        var id = ctx.request.body.id;
        if (!id) {
            ctx.body = {
                code: 400,
                msg: "组织ID不能为空"
            };
            return;
        }
        let userres = await query.query(sqlUser.getUsersByPorgID, [id]);
        if (userres.code && userres.result.length) {
            ctx.body = {
                code: 400,
                msg: "该组织中存在用户，禁止删除"
            };
            return;
        }
        let result = await query.query(sql.getOrganizationByID, [id]);
        if (!result.result.length) {
            ctx.body = {
                code: 400,
                msg: "组织ID不存在"
            };
            return;

        }
        organizationlist.push(result.result[0]);
        await getChildNode(id, organizationlist);
        let IDs = []
        for (var temp of organizationlist) {
            IDs.push(temp.ID);
        }

        let res = await query.query(sql.deleteOrganization, [IDs.toString()]);
        if (res.code && res.result.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: "删除成功"
            };
        } else {
            ctx.body = {
                code: 400,
                msg: "删除失败"
            };
        }
        return;
    } catch (e) {
        logger.Error('/organization/deleteOrganization异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }

}

exports.getAllOrganization = async function (ctx, next) {
    try {
        let result = await query.query(sql.getAllOrganization);
        //  logger.Info('api/getallpermission：' + JSON.stringify(result), "control");
        ctx.body = {
            code: 200,
            msg: "",
            data: result.result
        };
        return;
    } catch (e) {
        logger.Error('/organization/getallorganization异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }

}

exports.getOrganizationByID = async function (ctx, next) {
    try {
        var organizationid = ctx.request.body.organizationid;
        if (!organizationid) {
            ctx.body = {
                code: 400,
                msg: "组织ID不能为空"
            };
            return;
        }
        let result = await query.query(sql.getOrganizationByID, [organizationid]);
        ctx.body = {
            code: 200,
            msg: "",
            data: result.result[0]
        };
        return;
    } catch (e) {
        logger.Error('/organization/getchildpermissionbyid异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}


exports.getChildOrganizationByID = async function (ctx, next) {
    try {
        var organizationlist = [];
        var organizationid = ctx.request.body.organizationid;
        if (!organizationid) {
            ctx.body = {
                code: 400,
                msg: "组织ID不能为空"
            };
            return;
        }
        let result = await query.query(sql.getOrganizationByID, [organizationid]);
        if (!result.result.length) {
            ctx.body = {
                code: 400,
                msg: "权限ID不存在"
            };
            return;

        }
        organizationlist.push(result.result[0]);
        await getChildNode(organizationid, organizationlist);
        //  logger.Info('api/getchildpermissionbyid' + JSON.stringify(result), "control");
        ctx.body = {
            code: 200,
            msg: "",
            data: organizationlist
        };
        return;
    } catch (e) {
        logger.Error('/organization/getchildpermissionbyid异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}
async function getChildNode(id, organizationlist) {

    let result = await query.query(sql.getChildOrganizationByID, [id]);
    if (result.result.length > 0) {
        for (let temp of result.result) {
            organizationlist.push(temp)
            await getChildNode(temp.ID, organizationlist)
        }
    }

}
export { getChildNode }