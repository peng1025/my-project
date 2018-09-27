const query = require('../middler/mysql');
const checkCode = require('../middler/checkCode');
const logger = require('../middler/logger');
const sql = require('../sql/account');
const permissionSql = require('../sql/permission');
const orgSql = require('../sql/organization');
const tool = require('../middler/tool'); //{ md5, format } from '../middler/tool';
const http = require('../middler/http');
const redis = require('../middler/redis');
import moment from "moment";
//import { date } from 'is-type-of';
const qr_image = require('qr-image');
const env = require('../dev.cnf');
import { sendMessage } from '../service/sms'


//登录
exports.login = async function login(ctx, next) {
    try {

        let userName = ctx.request.body.userName;
        let password = ctx.request.body.password;

        if (!userName || !password) {
            ctx.body = {
                code: 400,
                msg: "账号或密码不能为空"
            };
            return;
        }
        let res = await checkCodeFunc(env.checkCodeType, ctx)

        if (!res.suc) {
            ctx.body = {
                code: res.code,
                msg: res.msg
            }
            return
        }

        let result = await query.query(sql.login, [userName, tool.md5(password)]);

        if (result.code && result.result.length > 0) {
            ctx.session.captcha = null;
            var errTime = await redis.get('errTime', userName);
            if (errTime.success && errTime.data) {
                await redis.delete('errTime', userName);
            }
            let updateLoginTime = await query.query(sql.updateLastLoginTime, [moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), result.result[0].ID])
            let session = ctx.session;
            session.isLogin = true;
            session.userName = userName;
            session.userId = result.result[0].ID;
            session.orgId = result.result[0].OrgID;
            // if (session.permission) {
            //     session.permission = null;
            // }
            let permissionObj = await getPermissionFunc(session);
            let allPermissionResult = await getAllPermissionFunc(session, permissionObj);

            let redisR = await redis.set('token', userName, parseInt(Math.random() * 100000));
            if (!redisR.success) {
                logger.Error('api/login-redis.set：' + redisR.message);
            }
            let orgResult = await query.query(orgSql.getOrganizationByID, result.result[0].OrgID);
            if (orgResult.code && orgResult.result.length > 0) {
                ctx.body = {
                    code: 200,
                    msg: "",
                    data: {
                        ID: result.result[0].ID,
                        Name: result.result[0].Name,
                        IsManage: result.result[0].IsManage,
                        OrgID: result.result[0].OrgID,
                        OrgName: orgResult.result[0].Name,
                        OrgParentID: orgResult.result[0].ParentID,
                        permission: allPermissionResult
                    }
                };
            } else {

                ctx.body = {
                    code: 200,
                    msg: "",
                    data: {
                        ID: result.result[0].ID,
                        Name: result.result[0].Name,
                        IsManage: result.result[0].IsManage,
                        OrgID: null,
                        OrgName: null,
                        OrgParentID: null,
                        permission: allPermissionResult
                    }
                };

            }
            return;
        } else {
            ctx.session = null;
            var errTime = await redis.get('errTime', userName);

            if (errTime.success && errTime.data) {
                let errTimes = parseInt(errTime.data)
                errTimes = ++errTimes;

                await redis.set('errTime', userName, errTimes);
            } else {
                errTime = await redis.set('errTime', userName, 1);
            }
            ctx.body = {
                code: 400,
                msg: "账号或密码错误"
            };
            return;
        }
    } catch (e) {
        logger.Error('/pub/login异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            message: e.message
        };
    }
}

async function getPermissionFunc(session) {
    var permissionResult;
    let permissionObj = {};
    if (session.userName == "system") {
        permissionResult = await query.query(permissionSql.getSimpleAllValidPermission);
    } else {
        permissionResult = await query.query(permissionSql.getSimplePermissionByUserID, [session.userId]);
    }
    if (permissionResult.code && permissionResult.result.length > 0) {

        permissionResult.result.forEach(function (item) {
            if (item.Url) {
                permissionObj[item.Url.toLowerCase()] = true;
            }
        })
        await redis.set('permission', session.userName, JSON.stringify(permissionObj));
    }

    return permissionObj;
}
async function getAllPermissionFunc(session, userPermissionObj) {
    let permissionObj = {};
    var permissionResult = await query.query(permissionSql.getAllValidPermission);
    if (permissionResult.code && permissionResult.result.length > 0) {
        if (session.userName == 'system') {
            permissionResult.result.forEach(function (item, index) {
                permissionResult.result[index].hasRight = true;
            })
        } else {
            permissionResult.result.forEach(function (item, index) {
                if (item.Url && userPermissionObj[item.Url.toLowerCase()]) {
                    permissionResult.result[index].hasRight = true;
                }
                else {
                    permissionResult.result[index].hasRight = false;
                }
            })
        }
    }
    return permissionResult.result;
}
//登出
exports.signout = async function signout(ctx, next) {
    try {
        if (ctx.session) {
            let userName = ctx.session.userName;
            ctx.session = null;
            await redis.delete('permission', userName);
            let redisRR = await redis.get('token', userName);

            let redisR = await redis.delete('token', userName);
            if (!redisR.success) {
                logger.Error('api/login-redis.set：' + redisR.message);
            }

        }
        ctx.body = {
            code: 200,
            msg: ''
        };
    } catch (e) {
        ctx.body = {
            code: 500,
            msg: e.message
        };
        logger.Error('api/signout异常：' + e.message, 'control');
    }
}








exports.regist = async function regist(ctx, next) {
    try {
        logger.Info('api/regist：' + "sfdf", 'control1');
        let userName = ctx.request.body.userName;
        let password = ctx.request.body.password;
        if (!userName || !password) {
            ctx.body = {
                code: 400,
                msg: "账号或密码不能为空"
            };
            return;
        }
        if (userName.length > 50 || !password.length > 50) {
            ctx.body = {
                code: 400,
                msg: "账号或密码长度过长"
            };
            return;
        }
        let exitisUser = await query.query(sql.exitisUser, [userName]);

        if (exitisUser.code && exitisUser.result.length > 0) {
            ctx.body = {
                code: 400,
                msg: "账号已存在"
            };
            return;
        }
        let result = await query.query(sql.regist, [userName, tool.md5(password)]);
        logger.Info('pub/regist：' + JSON.stringify(result));
        if (result && result.code) {
            ctx.body = {
                code: 200,
                msg: ""
            };

            return;
        } else {
            ctx.body = {
                code: 501,
                msg: "注册失败:" + result.message
            };
            return;
        }
    } catch (e) {
        ctx.body = {
            code: 500,
            msg: e.message
        };
        logger.Error('api/regist异常：' + e.message, 'control');
    }
}


exports.requestData = async function requestData(ctx, next) {
    try {

        let data1 = await http.post('http://127.0.0.1:8010/module/admin/GetDataP.string', { a: 1 });
        let data2 = await http.get(tool.format('http://127.0.0.1:8010/module/admin/GetDataP.string?a={a}', { a: 2 }));

        ctx.body = {
            code: 200,
            data1: data1,
            data2: data2
        };
    } catch (e) {
        ctx.body = {
            code: 500,
            msg: e.message
        };
        logger.Error('api/requestData异常：' + e.message, 'control');
    }
}
exports.setRedis = async function setRedis(ctx, next) {
    try {

        let data1 = await http.post('http://127.0.0.1:8010/module/admin/GetDataP.string', { a: 1 });
        let data2 = await http.get(tool.format('http://127.0.0.1:8010/module/admin/GetDataP.string?a={a}', { a: 2 }));

        ctx.body = {
            code: 200,
            data1: data1,
            data2: data2
        };
    } catch (e) {
        ctx.body = {
            code: 500,
            msg: e.message
        };
        logger.Error('api/requestData异常：' + e.message, 'control');
    }
}

exports.getCheckCode = async function (ctx, next) {
    if (!ctx.header.referer) { //防止刷接口 px
        ctx.body = '没有了，请稍后';
        return;
    }
    let captcha = new checkCode.getCheckCode();
    ctx.session.captcha = captcha.text.toLowerCase();
    var date = new Date();
    var min = date.getMinutes();
    date.setMinutes(min + 10);
    ctx.session.captchaExpireTime = date;
    ctx.response.type = "svg";
    ctx.response.body = captcha.data;
}



exports.sendSmsCheckCode = async function (ctx, next) {
    if (!ctx.header.referer) { //防止刷接口 px
        ctx.body = '没有了，请稍后';
        return;
    }
    let phoneNo = ctx.request.body.phoneNo;

    if (!tool.isPoneAvailable(phoneNo)) {
        ctx.body = {
            code: 500,
            msg: "手机号无效"
        };
        return;
    }
    var smsObj = await redis.get('smsCheckCode', phoneNo);
    if (smsObj.success && smsObj.data) {
        var sendSmsObj = JSON.parse(smsObj.data);
        if (sendSmsObj.sendTimes > 6) {
            ctx.body = {
                code: 500,
                msg: "发送短信次数过多"
            };
            return;
        }
        if (parseInt(Math.abs(new Date() - new Date(sendSmsObj.sendTime)) / 1000 / 60) < 1) {
            ctx.body = {
                code: 500,
                msg: "短信时间间隔不能小于1分钟"
            };
            return;
        }
        if (ctx.session.smsTime) {
            if (parseInt(Math.abs(new Date() - new Date(ctx.session.smsTime)) / 1000 / 60) < 1) {
                ctx.body = {
                    code: 500,
                    msg: "短信时间间隔不能小于1分钟"
                };
                return;
            }
        }
        ctx.session.smsCode = tool.MathRand(6);
        ctx.session.smsTime = new Date();

        let res = await sendMessage(phoneNo, `验证码：${ctx.session.smsCode}`)
        if (res.suc) {
            sendSmsObj.sendTimes = sendSmsObj.sendTimes + 1;
            sendSmsObj.sendTime = new Date();
            await redis.set('smsCheckCode', phoneNo, JSON.stringify(sendSmsObj));
            ctx.body = {
                code: 500,
                msg: "短信发送成功"
            };
            return;
        } else {
            ctx.body = {
                code: 500,
                msg: "短信发送失败"
            };
            return;
        }
    }

    else {
        ctx.session.smsCode = tool.MathRand(6);
        ctx.session.smsTime = new Date();
        let res = await sendMessage(phoneNo, `验证码：${ctx.session.smsCode}`)
        if (res.suc) {
            var sendSmsObj = {
                sendTimes: 1,
                sendTime: new Date()
            }
            await redis.set('smsCheckCode', phoneNo, JSON.stringify(sendSmsObj));
            ctx.body = {
                code: 500,
                msg: "短信发送成功"
            };
            return;
        } else {
            ctx.body = {
                code: 500,
                msg: "短信发送失败"
            };
            return;
        }
    }

}

exports.getQrCode = async function (ctx, next) {
    var url = ctx.request.query.codeurl || "http://www.baidu.com";
    var temp_qrcode = qr_image.image(url);
    ctx.status = 200;
    ctx.type = 'image/png';
    ctx.body = temp_qrcode;
}

async function checkCodeFunc(type, ctx) {
    switch (type) {
        case "captcha": return await checkCodeCaptcha(ctx);
        default: return false;
    }
}

async function checkCodeCaptcha(ctx) {
    let checkcode = ctx.request.body.checkcode;
    let userName = ctx.request.body.userName;
    let res = {};
    if (ctx.session.captcha) {
        if (checkcode.toLowerCase() != ctx.session.captcha) {
            res = {
                suc: false,
                code: 406,
                msg: "验证码错误"
            }
            return res;
        }
    }

    if (new Date() > new Date(ctx.session.captchaExpireTime)) {
        res = {
            suc: false,
            code: 406,
            msg: "验证码过期"
        }
        return res;
    }
    let errTime = await getErrTime(userName);
    if (errTime && errTime > 3) {
        if ((!ctx.session.captcha) || (!checkcode)) {
            res = {
                suc: false,
                code: 406,
                msg: "验证码不能为空"
            }
            return res;
        } else if (checkcode.toLowerCase() != ctx.session.captcha) {
            res = {
                suc: false,
                code: 406,
                msg: "验证码错误"
            }
            return res;
        }
    }
    res = {
        suc: true,
        code: 200,
        msg: "验证通过"
    }
    return res;
}

async function getErrTime(userName) {
    var errTime = await redis.get('errTime', userName);
    if (errTime.success && errTime.data) {
        var errTimes = parseInt(errTime.data);
        return errTimes
    } else {
        return null;
    }
}