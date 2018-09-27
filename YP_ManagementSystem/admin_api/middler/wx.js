import { createHash } from 'crypto';
const env = require('../dev.cnf');
const http = require('./http');
const tool = require('../middler/tool'); //{ md5, format } from '../middler/tool';
const logger = require('../middler/logger');
var wx = {
    async getToken() { //获取全局access_token
        let access_token = '';
        try {
            if (global.access_token && global.access_token.time > new Date().getTime()) {
                access_token = global.access_token.code;
            } else {
                //https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={appid}&secret={secret}
                let appid = env.wx.appid;
                let atData = await http.get(tool.format(env.wx.globaAaccesstokenUrl, { appid: appid, secret: env.wx.secret }));
                let access_token1 = JSON.parse(atData.data || "{}").access_token;
                logger.Info("access_token:" + atData.data);
                if (access_token1 && access_token1.length > 0) {
                    let da = new Date();
                    global.access_token = { code: access_token1, time: da.setSeconds(da.getSeconds() + 7000) };
                    access_token = access_token1;
                } else {

                }
            }
        } catch (ex) {
            logger.Error("access_token-获取异常:" + ex.message);
        }
        return access_token;
    },
    async getTicket(token) {
        let jsapi_ticket = '';
        try {
            if (global.jsapi_ticket && global.jsapi_ticket.time > new Date().getTime()) {
                jsapi_ticket = global.jsapi_ticket.code;
            } else {
                //https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi
                let atData = await http.get(tool.format(env.wx.globaljsapiticketUrl, { access_token: token }));
                //session.Log.error('getTicket-atData:' + atData.data);
                let ticket = V.json(atData.data || '{}').ticket;
                logger.Info("getTicket-atData:" + atData.data);
                if (ticket && ticket.length > 0) {
                    let da = new Date();
                    global.jsapi_ticket = { code: ticket, time: da.setSeconds(da.getSeconds() + 7000) };
                    jsapi_ticket = ticket;
                } else {
                    // logger.Info("getTicket-atData获取失败:" + atData);
                }
            }
        } catch (ex) {
            logger.Error('getTicket异常:' + ex.message);
        }
        return jsapi_ticket;
    },
    //生成签名方法
    async generateSign(timestamp, noncestr, jsapi_ticket, url) {
        var string1 = 'jsapi_ticket=' + jsapi_ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url;
        // console.log('===============',string1);
        return createHash('sha1').update(string1).digest('hex');
    }
}
module.exports = wx;