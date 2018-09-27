const env = require('../dev.cnf');
const sms = require('../middler/sms');
const logger = require('../middler/logger')
const query = require('../middler/mysql');
const smsSql = require('../sql/sms');
import moment from "moment";

//发短信
export async function sendMessage(telNo, content, operator) {
    let res = await sms.sendMessage(telNo, content, operator)
    if (res.suc) {
        await addSms(telNo, content, 1, operator);
        return {
            suc: true,
            message: "发送成功"
        }
    } else {
        await addSms(telNo, content, 0, operator);
        return {
            suc: true,
            message: "发送失败"
        }
    }
}


//添加短信记录
export async function addSms(phonenum, content, issuc, operator) {
    try {
        operator = operator || "system";
        let res = await query.query(smsSql.addSms, [phonenum, content, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), issuc, operator]);
        if (res.code && res.result.affectedRows > 0) {
            return true;
        }
        else {
            return false;
        }
    } catch (e) {
        logger.Error('api/addSms异常：' + e.message, 'control');
    }

}