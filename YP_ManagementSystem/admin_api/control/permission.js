const query = require('../middler/mysql');
const logger = require('../middler/logger');
const sql = require('../sql/permission');
const sqlrolepermission = require('../sql/rolepermission');
const tool = require('../middler/tool');
import moment from "moment";
const permission = require('../service/permission')//加载权限到redis

exports.addPermission = async function (ctx, next) {
    try {
        let parentid = ctx.request.body.parentid;
        let url = ctx.request.body.url;
        let name = ctx.request.body.name;
        let description = ctx.request.body.description;
        let type = ctx.request.body.type;
        let username = ctx.session.userName;
        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(username)) {
            paramsSuc = false;
            msg = "登录名不能为空";
        } else if (!tool.isValid(parentid)) {
            paramsSuc = false;
            msg = "父ID不能为空";
        } else if (!tool.isValid(name)) {
            paramsSuc = false;
            msg = "权限名称不能为空";
        } else if (!tool.isValid(type)) {
            paramsSuc = false;
            msg = "权限类型不能为空";
        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let presult = await query.query(sql.getPermissionByID, [parentid]);
        if (!presult.result.length) {
            ctx.body = {
                code: 400,
                msg: "父ID不存在"
            };
            return;
        }
        let nameResult = await query.query(sql.getPermissionByName, [name]);
        if (!!nameResult.result.length) {
            ctx.body = {
                code: 400,
                msg: "权限名称已存在"
            };
            return;
        }
        let result = await query.query(sql.addPermission, {
            Name: name,
            ParentID: parentid,
            Url: url,
            Type: type,
            CreateTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            CreateBy: username,
            Deflag: "0",
            Level: presult.result[0].Level + 1,
            Description: description
        });

        //  logger.Info('api/getallpermission：' + JSON.stringify(result), "control");
        if (result.code && result.result.length > 0) {
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
        permission.setPermissionListToRedis();
        return;
    } catch (e) {
        logger.Error('/permission/getallpermission异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}
exports.updatePermission = async function (ctx, next) {
    try {
        let id = ctx.request.body.id;
        let parentid = ctx.request.body.parentid;
        let url = ctx.request.body.url;
        let name = ctx.request.body.name;
        let description = ctx.request.body.description;
        let type = ctx.request.body.type;
        let username = ctx.session.userName;
        let paramsSuc = true;
        let msg = '';
        if (!tool.isValid(username)) {
            paramsSuc = false;
            msg = "登录名不能为空";
        } else if (!tool.isValid(parentid)) {
            paramsSuc = false;
            msg = "父ID不能为空";
        } else if (!tool.isValid(id)) {
            paramsSuc = false;
            msg = "权限ID不能为空";
        } else if (!tool.isValid(name)) {
            paramsSuc = false;
            msg = "权限名称不能为空";
        } else if (!tool.isValid(type)) {
            paramsSuc = false;
            msg = "权限类型不能为空";
        }
        if (!paramsSuc) {
            ctx.body = {
                code: 400,
                msg: msg
            };
            return;
        }
        let presult = await query.query(sql.getPermissionByID, [parentid]);
        if (!presult.result.length) {
            ctx.body = {
                code: 400,
                msg: "父ID不存在"
            };
            return;
        }
        let result = await query.query(sql.updatePermission, {
            Name: name,
            ParentID: parentid,
            ID: id,
            Url: url,
            Type: type,
            CreateTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            CreateBy: username,
            Deflag: "0",
            Level: presult.result[0].Level + 1,
            Index: "null",
            Description: description
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
                msg: "修改失败"
            };

        }
        permission.setPermissionListToRedis();
        return;
    } catch (e) {
        logger.Error('/permission/updatePermission异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}
exports.updatePermissionStatus = async function (ctx, next) {
    try {
        var permissionlist = [];
        var id = ctx.request.body.id;
        var deflag = ctx.request.body.deflag;
        if (!id) {
            ctx.body = {
                code: 400,
                msg: "权限ID不能为空"
            };
            return;
        }
        if (deflag !== 0 && deflag !== "0") {
            if (!deflag) {
                ctx.body = {
                    code: 400,
                    msg: "权限状态不能为空"
                };
                return;
            }
        }
        if (id == 1) {
            ctx.body = {
                code: 400,
                msg: "禁止直接操作根权限"
            };
            return;
        }
        let result = await query.query(sql.getPermissionByID, [id]);
        if (!result.result.length) {
            ctx.body = {
                code: 400,
                msg: "权限ID不存在"
            };
            return;

        }
        let IDs = []
        IDs.push(id);
        await getChildNode(id, IDs);

        let trans = new query.Transaction();
        let r = await trans.start();
        let sql1 = await trans.execute(sql.updatePermissionStatus, [deflag, IDs]);
       
        if (!sql1.code) {
           
            await trans.rollback();  //回滚
            ctx.body = {
                code: 400,
                msg: "设置失败"
            };
            return;
        }
        // if (deflag == 1) {
        //     //  console.log("执行sql2")
        //     let sql2 = await trans.execute(sqlrolepermission.deletePermissionByPermissionIDs, [IDs]);
        //     //  console.log(sql2.code,"sql2结果");
        //     if (!sql2.code) {
        //         //  console.log("sql2回滚")
        //         await trans.rollback();  //回滚
        //         ctx.body = {
        //             code: 400,
        //             msg: "设置失败"
        //         };
        //         return;
        //     }
        // }
        //  console.log("提 交")
        await trans.commit();  //提交
        ctx.body = {
            code: 200,
            msg: "设置成功"
        };
        // let res = await query.query(sql.updatePermissionStatus, [deflag, IDs]);
        // if (res.code && res.result.affectedRows > 0) {
        //     ctx.body = {
        //         code: 200,
        //         msg: "设置成功",
        //         data: permissionlist
        //     };
        // } else {
        //     ctx.body = {
        //         code: 400,
        //         msg: "设置失败"
        //     };
        // }
        permission.setPermissionListToRedis();
        return;
    } catch (e) {
        logger.Error('/permission/updatePermissionStatus异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }

}
exports.getAllPermission = async function (ctx, next) {
    try {

        let result = await query.query(sql.getAllPermission);
        //  logger.Info('api/getallpermission：' + JSON.stringify(result), "control");
        ctx.body = {
            code: 200,
            msg: "",
            data: result.result
        };
        return;
    } catch (e) {
        logger.Error('/permission/getallpermission异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }

}


exports.getAllValidPermission = async function (ctx, next) {
    try {

        let result = await query.query(sql.getAllValidPermission);
        //  logger.Info('api/getallpermission：' + JSON.stringify(result), "control");
        ctx.body = {
            code: 200,
            msg: "",
            data: result.result
        };
        return;
    } catch (e) {
        logger.Error('api/permissionsManage/getallpermission异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }

}
exports.deletePermissionByID = async function (ctx, next) {
    try {
        let id = ctx.request.body.id;
        if (!id) {
            ctx.body = {
                code: 400,
                msg: "权限ID不能为空"
            };
            return;
        }
        let result = await query.query(sql.getPermissionByID, [id]);
        if (!result.result.length) {
            ctx.body = {
                code: 400,
                msg: "权限ID不存在"
            };
            return;
        }
        var permissionlist = [];
        permissionlist.push(result.result[0]);
        await getChildNode(id, permissionlist);
        if (permissionlist.length > 1) {
            ctx.body = {
                code: 400,
                msg: "存在子权限，禁止删除"
            };
            return;
        }
        let trans = new query.Transaction();
        let r = await trans.start();

        let sql2 = await trans.execute(sqlrolepermission.deletePermissionByPermissionIDs, [id]);

        if (!sql2.code) {
          
            await trans.rollback();  //回滚
            ctx.body = {
                code: 400,
                msg: "删除失败"
            };
            return;
        }
        let sql1 = await trans.execute(sql.deletePermissionByID, [id]);

        if (!sql1.code) {
           
            await trans.rollback();  //回滚
            ctx.body = {
                code: 400,
                msg: "删除失败"
            };
            return;
        }
        await trans.commit();  //提交

        permission.setPermissionListToRedis();
        ctx.body = {
            code: 200,
            msg: "删除成功"
        };
        return;
    } catch (e) {
        logger.Error('api/permissionsManage/deletePermissionByID异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }
}
exports.getChildPermissionByID = async function (ctx, next) {
    try {
        var permissionlist = [];
        var id = ctx.request.body.id;
        let start = ctx.request.body.start;
        let size = ctx.request.body.size;
        let paramsSuc = true;
        if (!tool.isValid(start)) {
            paramsSuc = false;
            msg = "start不能为空";
        } else if (!tool.isValid(size)) {
            paramsSuc = false;
            msg = "size不能为空";
        } else if (!tool.isValid(!id)) {
            paramsSuc = false;
            msg = "权限ID不能为空";
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
        start = start < 0 ? 0 : start;
        size = size < 0 ? 0 : size;
        let result = await query.query(sql.getPermissionByID, [id]);
        if (!result.result.length) {
            ctx.body = {
                code: 400,
                msg: "权限ID不存在"
            };
            return;

        }
        permissionlist.push(result.result[0].ID);
        await getChildNode(id, permissionlist);
        //  logger.Info('api/getchildpermissionbyid' + JSON.stringify(result), "control");
        result = await query.query(sql.getChildPermissionByPage, [permissionlist, start, size, permissionlist])
        ctx.body = {
            code: 200,
            msg: "",
            data: {
                result: result.result[0],
                count: result.result[1][0].count
            }
        }

        return;
    } catch (e) {
        logger.Error('api/permissionsManage/getchildpermissionbyid异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }


}
async function getChildNode(id, permissionlist) {

    let result = await query.query(sql.getChildPermissionByID, [id]);
    if (result.result.length > 0) {
        for (let temp of result.result) {
            permissionlist.push(temp.ID)
            await getChildNode(temp.ID, permissionlist)
        }
    }

}

exports.getPermissionByUserID = async function (ctx, next) {
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
        let result = await query.query(sql.getPermissionByUserID, [id]);
        ctx.body = {
            code: 200,
            msg: "",
            data: result.result
        }
        return
    } catch (e) {
        logger.Error('api/permissionsManage/getPermissionByUserID异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        };
    }

}
