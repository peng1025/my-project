const query = require('../middler/mysql');
const logger = require('../middler/logger');
const sql = require('../sql/userrole');
const tool = require('../middler/tool');
const http = require('../middler/http');
import moment from "moment";


exports.setUserRole = async function (ctx, next) {
    try {
        let id = ctx.request.body.id;
        let roles = ctx.request.body.roles;
        let username = ctx.session.userName;
        let paramsSuc = true;
        let msg = '';

        if (!tool.isValid(username)) {
            paramsSuc = false;
            msg = "登录名不能为空";
        } else if (!tool.isValid(id)) {
            paramsSuc = false;
            msg = "用户ID不能为空";
        } else if (!tool.isValid(roles)) {
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
        let res = await query.query(sql.deleteRoleByUserID, [id])
        if (!res.code) {
            ctx.body = {
                code: 400,
                msg: "旧权限删除失败,操作失败"
            };
            return;
        }
        if (roles.length > 0) {
            let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            let values = [];
            for (let i = 0; i < roles.length; i++) {
                values.push([id, roles[i], time, username]);
            }
            let result = await query.query(sql.setUserRole, [values]);
            if (result.code && result.result.affectedRows > 0) {
                ctx.body = {
                    code: 200,
                    msg: ""
                };
            } else {
                ctx.body = {
                    code: 400,
                    msg: result.message || "操作失败"
                };
            }
        }
        ctx.body = {
            code: 200,
            msg: ""
        };
        return;
    } catch (e) {
        logger.Error('/userrole/getallpermission异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}

exports.deleteUserRole = async function (ctx, next) {
    try {
        let id = ctx.request.body.id;
        let roles = ctx.request.body.roles;
        let username = ctx.session.userName;
        let paramsSuc = true;
        let msg = '';

        if (!tool.isValid(username)) {
            paramsSuc = false;
            msg = "登录名不能为空";
        } else if (!tool.isValid(id)) {
            paramsSuc = false;
            msg = "用户ID不能为空";
        } else if (!tool.isValid(roles)) {
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
        let res = await query.query(sql.deleteUserRoleByRoleIDs, [roles.toString(), id])
        if (res.code && res.result.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: ""
            };
        } else {
            ctx.body = {
                code: 400,
                msg: res.message || "删除失败"
            };
        }
        return;
    } catch (e) {
        logger.Error('/userrole/deleteUserRole异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}
exports.getRoleByUserID = async function (ctx, next) {
    try {
        let id = ctx.request.body.id;
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
        let res = await query.query(sql.getRoleByUserID, [id])
        ctx.body = {
            code: 200,
            msg: "",
            data: res.result
        }
        return;
    } catch (e) {
        logger.Error('/userrole/getRoleByUserID异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}