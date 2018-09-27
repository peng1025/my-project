const logger = require('./logger');
const redis = require('./redis');
const permission = require('../service/permission') //加载权限到redis



function checkPermission() {
    return async function(ctx, next) {
        try {
            if (ctx.path.toLowerCase().indexOf('/pub/') == 0) { //公开访问
                return next();
            }
            if (ctx.path.toLowerCase().indexOf('/login/') == 0) { //登录后可访问
                return next();
            }
            if (ctx.session.userName == "system") { //登录账号为system拥有全部权限
                return next();
            }
            let url = ctx.req.url.toLowerCase();
            var pObj = await redis.get('permission', ctx.session.userName); //获取用户权限
            if (!(pObj && pObj.data)) {
                ctx.body = {
                    code: 401,
                    msg: "请重新登录"
                };
                return;
            }
            var permissionObj = JSON.parse(pObj.data);
            if (permissionObj && permissionObj[url]) { //如果权限存在则通过
                return next();
            } else {
                var allObj = await redis.get('allPermission', '$jdspbpermissionlist$'); //查全部的权限
                var allPermissionObj
                if (!(allObj && allObj.data)) {
                    allPermissionObj = permission.setPermissionListToRedis();
                } else {
                    allPermissionObj = JSON.parse(allObj.data);
                }
                if (allPermissionObj && allPermissionObj[url]) { //如果权限表中要求有权限
                    ctx.body = {
                        code: 400,
                        msg: "无操作权限"
                    };
                    return;
                } else { //权限表中没要求权限
                    var reg = /\/api(\/[^\/]+)\/[^\/]+/;
                    var group = url.match(reg);
                    if (permissionObj[group[1]]) { //判断父页面权限
                        return next();
                    } else {
                        ctx.body = {
                            code: 400,
                            msg: "无操作权限"
                        };
                        return;
                    }
                }
            }
            ctx.body = {
                code: 400,
                msg: "无操作权限"
            };
            return;

        } catch (e) {
            logger.Error('checkPermission异常：' + e.message, 'control');
            ctx.body = {
                code: 500,
                msg: e.message
            };
            return;
        }
    }
}



// function checkPermission(allowPath) {
//     return async function (ctx, next) {
//         try {
//             if (allowPath[ctx.req.url.toLowerCase()]) {
//                 return next();
//             }
//             let result = await query.query(tool.format(sql.getPermissionByUrl, { Url: ctx.req.url }));

//             if (result.code && result.result.length > 0) {//需要验证权限
//                 var temp = await redis.get('permission', ctx.session.userName);
//                 var permissionObj = JSON.parse(temp.data);
//                 if (permissionObj && permissionObj[ctx.req.url.toLowerCase()]) {
//                     // ctx.session.permission //&& ctx.session.permission[ctx.req.url.toLowerCase()]
//                     await next();
//                 } else {
//                     ctx.body = {
//                         code: 400,
//                         msg: "无操作权限"
//                     };
//                     return;
//                 }
//             } else if (pagemap[ctx.req.url.toLowerCase()]) {//需要验证功能的页面权限
//                 let pageResult = await query.query(tool.format(sql.getPermissionByUrl, { Url: pagemap[ctx.req.url.toLowerCase()] }));
//                 if (pageResult.code && pageResult.result.length > 0) {
//                     var temp = await redis.get('permission', ctx.session.userName);
//                     var permissionObj = JSON.parse(temp.data);
//                     if (permissionObj && permissionObj[pagemap[ctx.req.url.toLowerCase()]]) {
//                         // ctx.session.permission //&& ctx.session.permission[ctx.req.url.toLowerCase()]
//                         await next();
//                     } else {
//                         ctx.body = {
//                             code: 400,
//                             msg: "无操作权限"
//                         };
//                         return;
//                     }
//                 } else {
//                     await next();

//                 }

//             }
//             else {//不需要验证权限
//                 await next();
//             }

//         } catch (e) {
//             logger.Error('checkPermission异常：' + e.message, 'control');
//             ctx.body = {
//                 code: 500,
//                 msg: e.message
//             };
//             return;
//         }
//     }
// }

// function checkPermission(allowPath) {
//     return async function (ctx, next) {
//         try {
//             if (allowPath[ctx.req.url.toLowerCase()]) {//公开页面
//                 return next();
//             }
//             else if (pagemap[ctx.req.url.toLowerCase()]) {//需要检查页面权限
//                 var temp = await redis.get('permission', ctx.session.userName);
//                 var permissionObj = JSON.parse(temp.data);
//                 if (permissionObj && permissionObj[pagemap[ctx.req.url.toLowerCase()]]) {
//                     // ctx.session.permission //&& ctx.session.permission[ctx.req.url.toLowerCase()]
//                     await next();
//                 } else {
//                     ctx.body = {
//                         code: 400,
//                         msg: "无操作权限"
//                     };
//                     return;
//                 }
//             } else {//检查权限
//                 var temp = await redis.get('permission', ctx.session.userName);
//                 var permissionObj = JSON.parse(temp.data);
//                 if (permissionObj && permissionObj[ctx.req.url.toLowerCase()]) {
//                     // ctx.session.permission //&& ctx.session.permission[ctx.req.url.toLowerCase()]
//                     await next();
//                 } else {
//                     ctx.body = {
//                         code: 400,
//                         msg: "无操作权限"
//                     };
//                     return;
//                 }
//             }

//         } catch (e) {
//             logger.Error('checkPermission异常：' + e.message, 'control');
//             ctx.body = {
//                 code: 500,
//                 msg: e.message
//             };
//             return;
//         }
//     }
// }





// if (!await check.checkPagePermission("afadfasdf")) {
//     ctx.body = {
//         code: 400,
//         msg: "无页面权限"
//     };
//     return;
// }



async function checkPagePermission(pageUrl) {

    try {
        let temp = await redis.get('permission', ctx.session.userName);
        let permissionObj = JSON.parse(temp.data);
        if (permissionObj && permissionObj[pageUrl.toLowerCase()]) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}
module.exports = { checkPermission, checkPagePermission }