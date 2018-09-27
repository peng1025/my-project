const env = require('../dev.cnf');
import soap from 'soap';
const logger = require("./logger");
const http = require('./http');

//短信接口
export async function sendMessage(telNo, content, operator) {
    operator = operator || "system";
    var res = {}
    try {
        var surl = env.message.sendMessageUrl;
        var args = { account: { PassWord: env.message.PassWord, UserName: env.message.UserName }, beforeString: "", afterString: "", channel: env.message.channel, mobile: telNo, content: content };
        var clientResult = await http.soap(surl, args);
        console.log(clientResult);
        if (!clientResult.success) {
            return {
                suc: false,
                message: "发送失败"
            }
        } else {
            return {
                suc: true,
                message: "发送成功"
            }
        }
    } catch (e) {
        return {
            suc: false,
            message: e.message
        }

    }
}




// //短信接口
// export async function sendMessage(telNo, content, operator) {
//     operator = operator || "system";
//     var res = {}
//     try {
//         var surl = env.message.sendMessageUrl;
//         var args = { account: { PassWord: env.message.PassWord, UserName: env.message.UserName }, beforeString: "", afterString: "", channel: env.message.channel, mobile: telNo, content: content };
//         var clientResult = await new Promise((resolve, reject) => {
//             soap.createClient(surl, function (err, client) {
//                 if (err) {
//                     reject(null)
//                 }
//                 else {
//                     resolve(client);
//                 }
//             });
//         });
//         if (!clientResult) {
//             return {
//                 suc: false,
//                 message: "未连接到短信服务"
//             }
//         }
//         let clientResult1 = await new Promise((resolve, reject) => {
//             clientResult.SendMessageImmediateValidate(args, function (err, result) {
//                 if (err) {
//                     reject({
//                         suc: false,
//                         message: err
//                     })

//                 } else {
//                     if (result.SendMessageImmediateValidateResult.Status == "true") {
//                         resolve({
//                             suc: true,
//                             message: "发送成功"
//                         });
//                     } else {
//                         resolve({
//                             suc: false,
//                             message: result.SendMessageImmediateValidateResult.Message
//                         });
//                     }
//                 }
//             });
//         });
//         var a = 3;
//         return clientResult1;
//     } catch (e) {
//         return {
//             suc: false,
//             message: e.message
//         }

//     }
// }

module.exports = { sendMessage };