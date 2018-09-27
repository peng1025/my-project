const query = require('../middler/mysql');
const logger = require('../middler/logger');
const sql = require('../sql/role');
const sqlUserRole = require('../sql/userrole');
const sqlRolePermission = require('../sql/rolepermission');
const sqlPermission = require('../sql/permission')
const sqlOrgRole = require('../sql/orgrole');
const tool = require('../middler/tool');
import moment from "moment";

exports.addRole = async function (ctx, next) {
    try {
        let name = ctx.request.body.name;
        let description = ctx.request.body.description;
        let username = ctx.session.userName;
        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(name)) {
            paramsSuc = false;
            msg = "角色名称不能为空";
        } else if (!tool.isValid(username)) {
            paramsSuc = false;
            msg = "登录名不能为空";
        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let roleRes = await query.query(sql.getRoleByName, [name]);
        if (roleRes.code && roleRes.result.length > 0) {
            ctx.body = {
                code: 400,
                msg: "角色名已存在"
            };
        }
        let result = await query.query(sql.addRole, {
            Name: name,
            CreateTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            CreateBy: username,
            Description: description
        });


        if (result.code && result.result.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: ""
            };
        } else {
            ctx.body = {
                code: 400,
                msg: "添加失败"
            };
        }
        return;
    } catch (e) {
        logger.Error('/role/addRole异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            message: e.message
        };
    }
}
exports.addRoleWithPermission = async function (ctx, next) {
    try {
        let name = ctx.request.body.name;
        let description = ctx.request.body.description;
        let permissions = ctx.request.body.permissions;
        let username = ctx.session.userName;
        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(name)) {
            paramsSuc = false;
            msg = "角色名称不能为空";
        } else if (!tool.isValid(username)) {
            paramsSuc = false;
            msg = "登录名不能为空";
        } else if (!tool.isValid(permissions)) {
            paramsSuc = false;
            msg = "权限参数不能为空";
        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let roleRes = await query.query(sql.getRoleByName, [name]);
        if (roleRes.code && roleRes.result.length > 0) {
            ctx.body = {
                code: 400,
                msg: "角色名已存在"
            };
            return;
        }
        permissions = tool.unique(permissions);
        var ress = await query.query(sqlPermission.getPermissionByIDs, [permissions]);
        if (permissions.length != ress.result.length) {
            ctx.body = {
                code: 400,
                msg: "权限参数中存在无效数据"
            };
            return;
        }
        let trans = new query.Transaction();
        let r = await trans.start();
        let sql1 = await trans.execute(sql.addRole, {
            Name: name,
            CreateTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            CreateBy: username,
            Description: description
        });

        if (!sql1.code) {

            await trans.rollback();  //回滚
            ctx.body = {
                code: 400,
                msg: "创建角色失败"
            };
            return;
        }
        let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        let values = [];
        for (let i = 0; i < permissions.length; i++) {
            values.push([sql1.result.insertId, permissions[i], time, username]);
        }
        let sql2 = await trans.execute(sqlRolePermission.setRolePermission, [values]);
        if (!sql2.code) {

            await trans.rollback();  //回滚
            ctx.body = {
                code: 400,
                msg: "角色授权失败"
            };
            return;
        }

        await trans.commit();  //提交
        ctx.body = {
            code: 200,
            msg: "操作成功"
        };
        return;
    } catch (e) {
        logger.Error('/role/addRoleWithPermission异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            message: e.message
        };
    }

}
exports.updateRole = async function (ctx, next) {
    try {
        let id = ctx.request.body.id;
        let name = ctx.request.body.name;
        let description = ctx.request.body.description;
        let username = ctx.session.userName;
        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(username)) {
            paramsSuc = false;
            msg = "登录名不能为空";
        } else if (!tool.isValid(id)) {
            paramsSuc = false;
            msg = "角色ID不能为空";
        } else if (!tool.isValid(name)) {
            paramsSuc = false;
            msg = "角色名称不能为空";
        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let roleRes = await query.query(sql.getRoleByName, [name]);
        if (roleRes.code && roleRes.result.length > 0) {
            ctx.body = {
                code: 400,
                msg: "角色名已存在"
            };
        }
        let result = await query.query(sql.updateRole, {
            Name: name,
            ID: id,
            CreateTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            CreateBy: username,
            Description: description
        });

        if (result.code && result.result.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: ""
            };
        } else {
            ctx.body = {
                code: 400,
                msg: "修改失败"
            };

        }
        return;
    } catch (e) {
        logger.Error('/role/updateRole异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}
exports.deleteRole = async function (ctx, next) {
    try {
        let ids = ctx.request.body.ids;
        let paramsSuc = true;
        let msg = '';
        if ((tool.isValid(ids)) && ids.length <= 0) {
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

        let trans = new query.Transaction();
        let r = await trans.start();

        let sql2 = await trans.execute(sqlUserRole.deleteRoleByRoleID, [ids]);

        if (!sql2.code) {

            await trans.rollback();  //回滚
            ctx.body = {
                code: 400,
                msg: "用户角色删除失败"
            };
            return;
        }
        let sql3 = await trans.execute(sqlRolePermission.deletePermissionByRoleID, [ids]);
        if (!sql3.code) {
            await trans.rollback();  //回滚
            ctx.body = {
                code: 400,
                msg: "角色权限删除失败"
            };
            return;
        }
        let sql4 = await trans.execute(sqlOrgRole.deleteRoleByRoleID, [ids]);
        if (!sql4.code) {
            await trans.rollback();  //回滚
            ctx.body = {
                code: 400,
                msg: "组织默认角色删除失败"
            };
            return;
        }
        let sql1 = await trans.execute(sql.deleteRole, [ids]);

        if (!sql1.code) {

            await trans.rollback();  //回滚
            ctx.body = {
                code: 400,
                msg: "角色删除失败"
            };
            return;
        }


        await trans.commit();  //提交
        ctx.body = {
            code: 200,
            msg: "删除成功"
        };
        return;
    } catch (e) {
        logger.Error('/role/deleteRole异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}
exports.getAllRole = async function (ctx, next) {
    try {
        let result = await query.query(sql.getAllRole);
        ctx.body = {
            code: 200,
            msg: "",
            data: result.result
        };
        return;
    } catch (e) {
        logger.Error('/role/getallpermission异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }

}
exports.getRoleByID = async function (ctx, next) {
    try {
        var id = ctx.request.body.id;
        let msg = '';
        if (!id) {
            ctx.body = {
                code: 400,
                msg: "权限ID不能为空"
            };
            return;
        }
        let result = await query.query(sql.getRoleByID, [id]);
        ctx.body = {
            code: 200,
            msg: "",
            data: result.result
        }
        return
    } catch (e) {
        logger.Error('/role/getRoleByID异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}
