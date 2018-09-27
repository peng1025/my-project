const query = require('../middler/mysql');
const logger = require('../middler/logger');
const sql = require('../sql/rolepermission');
const tool = require('../middler/tool');
const sqlPermission = require('../sql/permission')
import moment from "moment";


exports.setRolePermission = async function (ctx, next) {
    try {
        let id = ctx.request.body.id;
        let permissions = ctx.request.body.permissions;
        let username = ctx.session.userName;
        let paramsSuc = true;
        let msg = '';

        if (!tool.isValid(username)) {
            paramsSuc = false;
            msg = "登录名不能为空";
        } else if (!tool.isValid(id)) {
            paramsSuc = false;
            msg = "角色ID不能为空";
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
        permissions = tool.unique(permissions);
        var ress = await query.query(sqlPermission.getPermissionByIDs, [permissions]);
        if (permissions.length != ress.result.length) {
            ctx.body = {
                code: 400,
                msg: "权限参数中存在无效数据"
            };
            return;
        }
        let res = await query.query(sql.deletePermissionByRoleID, [id])
        if (!res.code) {
            ctx.body = {
                code: 400,
                msg: "旧权限删除失败,操作失败"
            };
            return;
        }
        let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        let values = [];
        for (let i = 0; i < permissions.length; i++) {
            values.push([id, permissions[i], time, username]);
        }
        let result = await query.query(sql.setRolePermission, [values]);
        if (result.code && result.result.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: "",
                data: result
            };
        } else {
            ctx.body = {
                code: 400,
                msg: "操作失败",
                data: result
            };
        }
        return;
    } catch (e) {
        logger.Error('/rolepermission/getallpermission异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}


exports.deleteRolePermission = async function (ctx, next) {
    try {
        let id = ctx.request.body.id;
        let permissions = ctx.request.body.permissions;
        let username = ctx.session.userName;
        let paramsSuc = true;
        let msg = '';

        if (!tool.isValid(username)) {
            paramsSuc = false;
            msg = "登录名不能为空";
        } else if (!tool.isValid(id)) {
            paramsSuc = false;
            msg = "角色ID不能为空";
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
        let res = await query.query(sql.deletePermissionByPermissionIDs, [permissions.toString()])
        if (res.code && res.result.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: ""
            };
        } else {
            ctx.body = {
                code: 400,
                msg: "删除失败"
            };
        }
        return;
    } catch (e) {
        logger.Error('/rolepermission/getallpermission异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}

exports.getPermissionByRoleID = async function (ctx, next) {
    try {
        let id = ctx.request.body.id;
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
        let res = await query.query(sql.getPermissionByRoleID, [id])
        ctx.body = {
            code: 200,
            msg: "",
            data: res.result
        }
        return;
    } catch (e) {
        logger.Error('/rolepermission/getPermissionByRoleID异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}