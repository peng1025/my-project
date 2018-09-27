const request = require('request');
const soap1 = require('soap');
export async function get(url) {
    return new Promise((resolve, reject) => {
        request(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log(body) // 请求成功的处理逻辑
                resolve({ success: true, data: body });
            } else {
                resolve({ success: false, msg: (error ? error.message : response.statusCode) });
            }
        });
    });

}
/*
针对普通ajax请求项目使用
*/
export async function post(url, data) {
    if (typeof data !== 'object') {
        data = {};
    }
    return new Promise((resolve, reject) => {
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(data),
            qs: data
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body) // 请求成功的处理逻辑
                resolve({ success: true, data: body });
            } else {
                resolve({ success: false, msg: (error ? error.message : response.statusCode) });
            }
        });
    });
}
/*
针对那些需要表单提交或koa-body解析的项目使用
*/
export async function postBody(url, data) {
    if (typeof data !== 'object') {
        data = {};
    }
    return new Promise((resolve, reject) => {
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Accept": "application/json; charset=UTF-8"
            },
            body: data
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body) // 请求成功的处理逻辑
                resolve({ success: true, data: body });
            } else {
                resolve({ success: false, msg: (error ? error.message : response.statusCode) });
            }
        });
    });
}
export async function soap(url, data = {}) {
    try {
        let urls = url.split('&&');
        if (urls.length != 2) {
            return { success: false, msg: '接口地址格式不正确' }
        }
        var clientResult = await new Promise((resolve, reject) => {
            soap1.createClient(urls[0], function(err, client) {
                if (err) {
                    reject(null)
                } else {
                    resolve(client);
                }
            });
        });
        if (!clientResult) {
            return {
                success: false,
                msg: "未连接到soap服务"
            }
        }
        let action = urls[1];
        let clientResult1 = await new Promise((resolve, reject) => {
            clientResult[action](data, function(err, result) {
                if (err) {
                    resolve({
                        success: false,
                        msg: err
                    })

                } else {
                    //SendMessageImmediateValidate
                    if (result[action + "Result"].Status == "true") {
                        resolve({
                            success: true,
                            message: "请求成功"
                        });
                    } else {
                        resolve({
                            success: false,
                            message: result[action + "Result"].Message
                        });
                    }
                }
            });
        });
        return clientResult1;
    } catch (e) {
        return { success: true, msg: e.message }
    }
}
module.exports = {get, post, soap, postBody };