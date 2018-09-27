const query = require('../middler/mysql');
const logger = require('../middler/logger');
const sqlOrgRole = require('../sql/orgrole');
const tool = require('../middler/tool');
const http = require('../middler/http');
//import moment from "moment";




exports.getRoleByOrgID = async function (ctx, next) {
    try {
        let id = ctx.request.body.id;
        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(id)) {
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
        let result = await query.query(sqlOrgRole.getRoleByOrgID, id)
        if (result.code) {
            ctx.body = {
                code: 200,
                msg: "",
                data: result.result
            }
        } else {
            ctx.body = {
                code: 400,
                msg: "查询失败"
            };
        }
        return;
    } catch (e) {
        logger.Error('/orgrole/getRoleByOrgID异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            message: e.message
        };
    }

}
