const fs = require('fs');
const xlsx = require('node-xlsx');
const logger = require('../middler/logger');
const uuid = require('./uuid');
const OSS = require('ali-oss').Wrapper;
const env = require('../dev.cnf');
import moment from "moment";


export async function test(ctx, next) {
    var data = [
        { age: 12, gender: '男', weight: '30kg' },
        { age: 13, gender: '女', weight: '29kg' }
    ]
    var result = await exportExecl(ctx, {
        title: ['年龄', '性别', '体重'],
        sheetName: 'sheet1',
        execlName: '人员信息'
    }, data);

    next();

}
/**
 * 导出execl
 */
export async function exportExecl(ctx, option, data) {
    /*
        option:{
            title:['年龄','性别','体重'],
            sheetName:'sheet1',
            execlName:'人员信息'
        }    
        ,
        data:[
            {age:12,gender:'男',weight:'30kg'},
            {age:13,gender:'女',weight:'29kg'}
        ]
    */
    if (!(Array.isArray(option.title) && Array.isArray(data))) {
        ctx.body = { code: 501, msg: '内部错误，必需是数组类型' };
    } else {
        try {
            let execlContent = [];
            data.forEach((value, index) => {
                let tempArray = [];
                for (let j in value) {
                    tempArray.push(
                        value[j]
                    )
                }
                execlContent.push(
                    tempArray
                )
            })
            execlContent.unshift(option.title)
            let buffer = xlsx.build([{ name: option.sheetName || 'sheet1', data: execlContent }]);
            ctx.set('Content-Type', 'application/vnd.openxmlformats');
            ctx.set("Content-Disposition", "attachment; filename=" + encodeURI(option.execlName) + ".xlsx");
            ctx.body = buffer;

        } catch (err) {
            ctx.body = { code: 500, msg: err }
        }
    }
}
/**
 * 导入execl
 */
export function importExecl(option) {
    /*
        option:{
            exclePath:`dir/resut.xlsx`,
            title:['品牌描述','型号']
        }   
    */
    try {
        const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(option.exclePath));
        if (workSheetsFromBuffer && workSheetsFromBuffer.length == 1) {
            if (workSheetsFromBuffer[0].data && workSheetsFromBuffer[0].data[0]) {
                let data = workSheetsFromBuffer[0].data;
                if (data[0].length != option.title.length) {
                    return {
                        success: false,
                        msg: '文件头长度与要求不符！'
                    }
                }
                let flag = true;
                for (let i = 0; i < data[0].length; i++) {
                    if (data[0][i] != option.title[i]) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    return {
                        success: true,
                        data: data.splice(1, data.length)
                    }
                } else {
                    return {
                        success: false,
                        msg: '文件头与要求不符！'
                    }
                }
            }
        } else {
            return {
                success: false,
                msg: '无法解析该文件！'
            }
        }
    } catch (err) {
        return {
            success: false,
            msg: '',
            message: err.message
        }
    }
}
export async function formSaveFile(form, req) {
    // if (!form || !form.parse) {
    //     return {
    //         success: false,
    //         message: "form对象错误"
    //     };
    //     return;
    // }
    return new Promise(function(resolve, reject) {
        form.parse(req, function(err, fields, files) {

            if (err) {
                //console.log('FormSaveFile', err);
                resolve({
                    success: false,
                    msg: "解析错误" + (err.code == 'ETOOBIG' ? '-上传文件过大' : ''),
                    message: 'form.parse:' + err.message
                });
                return;
            }
            let file = files && files[Object.keys(files)[0]];
            if (file && file[0]) {
                resolve({
                    success: true,
                    path: file[0].path,
                    fields: fields
                });
            } else {
                resolve({
                    success: false,
                    msg: "未获取到上传文件名"
                });
            }
        });
    });
}
export async function uploadOSS(path) {
    if (!path) {
        return {
            success: false,
            msg: "参数为空"
        }
    }
    try {
        let stream = fs.createReadStream(path);
        const guid = uuid.v1();
        const date = moment(new Date()).format("YYYY-MM-DD");
        let oss_folder = env.oss.folder;
        const destPath = `${oss_folder}/${date}/${guid}.jpg`;
        const ossClient = new OSS({
            accessKeyId: env.oss.access_keyid,
            accessKeySecret: env.oss.access_keysecret,
            bucket: env.oss.bucket,
            region: env.oss.region
        });
        let ossResult = await new Promise(async function(resolve, reject) {
            let result = await ossClient.putStream(destPath, stream, {
                timeout: 60 * 30 * 1000
            });
            resolve(result);
        });
        if (ossResult && ossResult.url) {
            return {
                success: true,
                url: ossResult.url
            }
        } else {
            return {
                success: false,
                msg: "上传图片服务器失败"
            }
        }
    } catch (e) {
        return {
            success: false,
            msg: e.message
        }
    }

}