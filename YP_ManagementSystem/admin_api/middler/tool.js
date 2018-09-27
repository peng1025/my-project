var _crypto = require('crypto');


//返回值表达式开头括号中的0貌似有点多余没啥用
function md5(text) {
    return (0, _crypto.createHash)('md5').update(text, 'utf-8').digest('hex');
};


///将字符串中包含的<%=abc%>或｛abc｝看做占位符，将其中的abc替换成  第二个参数对象中对应的abc属性的值  {abc:"1234345345345345"}
function format(s, o) {
    if (!s || !o) {
        return "";
    }
    if (s.indexOf('<%=') >= 0) return funrep(s, o, /<%=[^(%>)]+%>/gi, /<%=/g, /%>/g);
    if (s.indexOf('{') >= 0) return funrep(s, o, /\{[^(})]+\}/gi, /\{/g, /\}/g);
    return s;
};

function isRealNum(val) {
    // isNaN()函数 把空串 空格 以及NUll 按照0来处理 所以先去除
    if (val === "" || val == null) {
        return false;
    }
    if (!isNaN(val)) {
        return true;
    } else {
        return false;
    }
}
//请求返回信息
function rectx(ctx, code, msg) {
    ctx.body = {
        code: code,
        msg: msg
    };
}

function funrep(s, o, reg, lreg, rreg) {
    return s.replace(reg, function(word) { //word是自动传入的s中符合reg正则的所有子字符串
        var key = '' + word.replace(lreg, '').replace(rreg, '');
        if (o[key] === 0) {
            return o[key];
        }
        return o[key] || '';
    });
}

//判断data值是否有效
export function isValid(data) {
    if (typeof(data) != "undefined" && data != null && data != 'null' && !(data === '')) {
        return true;
    } else {
        return false;
    }
}

//验证手机号是否有效
export function isPoneAvailable(str) {
    var myreg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (!myreg.test(str)) {
        return false;
    } else {
        return true;
    }
}

//生成n位随机数
export function MathRand(n) {
    var Num = "";
    for (var i = 0; i < n; i++) {
        Num += Math.floor(Math.random() * 10);
    }
    return Num;
}

//用于拼接sql的where条件语句，多个条件时自动判断是否带上前面的where,如果有where了 直接加and 条件，如果没有where，就把where带上
export function getConditionString(conditionstring, condition, data, isstring = false) {

    var tempdata = isstring ? "'" + data + "'" : data
    return isValid(data) ? conditionstring.length == 0 ? " where " + condition + tempdata : " and " + condition + tempdata : "";
}

//data有效返回data，否则返回defaultdata
export function getValue(data, defaultData) {
    return isValid(data) ? data : defaultData;
}


//判断obj是否是数组
export function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]'; //A instanceof B :检测B.prototype是否存在于参数A的原型链上
}


//获取对象类型
export function getType(x) {
    if (x == null) {
        return "null";
    }
    var t = typeof x;
    if (t != "object" && t != 'Object') {
        return t;
    }
    if (isArray(x)) {
        return 'Array';
    }
    var c = Object.prototype.toString.apply(x);
    c = c.substring(8, c.length - 1);
    if (c != "Object") {
        return c;
    }
    if (x.constructor == Object) {
        return c;
    }
    if (x.prototype && "classname" in x.prototype.constructor &&
        typeof x.prototype.constructor.classname == "string") {
        return x.constructor.prototype.classname;
    }
    return "ukObject";
}

export function merge() {
    var _clone = function(source) {
        switch (getType(source)) {
            case 'Object':
            case 'object':
                return _merge({}, source);
                break;
            case 'array':
            case 'Array':
                var aim = [];
                for (var i in source) {
                    aim.push(_clone(source[i]));
                }
                return aim;
            default:
                return source;
                break;
        }
    };
    var _merge = function(aim, source) {
        if (!(typeof(source) == 'object' && !isArray(source))) { return aim; }
        for (var i in source) {
            if (source[i] != undefined) {
                if (!isValid(aim[i])) {
                    aim[i] = _clone(source[i]);
                } else {
                    switch (getType(aim[i])) {
                        case 'object':
                        case 'Object':
                            _merge(aim[i], source[i]);
                            break;
                        case 'Array':
                            //处理数组
                            var hasmergeIndex = false;
                            for (var i3 = 0, k = source[i][i3]; i3 < source[i].length; i3++, k = source[i][i3]) {
                                if (typeof(k.mergeIndex) == "number") {
                                    hasmergeIndex = true;
                                    if (aim[i].length < (k.mergeIndex + 1)) {
                                        aim[i].push(k);
                                    } else {
                                        aim[i][i3] = _merge(aim[i][i3], k);
                                    }
                                } else if (typeof(k.moveIndex) == "number") {
                                    hasmergeIndex = true;
                                    aim[i].splice(k.moveIndex, 0, k);
                                }
                            }
                            if (!hasmergeIndex) {
                                aim[i] = _clone(source[i]);
                            }
                            break;
                        default:
                            aim[i] = source[i];
                            break;
                    }
                }
            }
        }
        return aim;
    };
    var argu = arguments;
    if (argu.length < 2) { return argu[0] ? argu[0] : {} };
    if (argu.length > 0 && true == argu[argu.length - 1]) {
        var _ = argu[0];
        for (var i2 = 1; i2 < argu.length; i2++)
            _ = _merge(_, argu[i2]);
        return _;
    } else {
        var _ = {};
        for (var i2 = 0; i2 < argu.length; i2++)
            _ = _merge(_, argu[i2]);
        return _;
    }
}



//获取短链接
async function getShortUrl(url) {
    if (!url) {
        return {
            suc: false,
            msg: "参数为空"
        }
    }
    let request = require('./http');
    let env = require('../dev.cnf');
    //新浪生成短链接
    try {
        // console.log("send", body) get(uri: string, callback?: RequestCallback): TRequest;
        //[{"ur l _short":"http://t.cn/zTy0eJ 8","url _l o ng":"http://www.douban.com/note/249723561/","type":39}] 
        var res = await request.get(format(env.sinaShortUrl, { url: encodeURIComponent(url) }));
        if (res.success) {
            res = JSON.parse(res.data);
        }
        if (res && res.length > 0 && res[0].url_short) {
            return {
                suc: true,
                url: res[0].url_short
            }
        }

    } catch (e) {}
    //生成suo短链接
    try {
        // console.log("send", body) get(uri: string, callback?: RequestCallback): TRequest;
        //{"url":"http://suo.im/baidu","err":""}
        var res1 = await request.get(format(env.suoShortUrl, { url: encodeURIComponent(url) }));
        if (res1.success) {
            res1 = JSON.parse(res1.data);
        }
        if (res1 && res1.url) {
            return {
                suc: true,
                url: res1.url
            }
        }

    } catch (e) {}
    return {
        suc: true,
        url: url
    }
}

/** * 加密函数 * @param text 需要加密的内容 * @param key 秘钥 * @returns {Query|*} 密文 */
const encode = function(text, key) {
    var secret = key || "asdhjwheru#asd123&123";
    var cipher = _crypto.createCipher('aes-256-cbc', secret);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    console.log(crypted);
    return crypted;
}

/** * 解密函数 * @param text 需要解密的内容 * @param key 秘钥 * @returns {Query|*} */
const decode = function(text, key) {
    try {
        var secret = key || "asdhjwheru#asd123&123";
        var decipher = _crypto.createDecipher('aes-256-cbc', secret);
        var dec = decipher.update(text, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return {
            suc: true,
            val: dec
        };
    } catch (e) {
        return {
            suc: false,
            val: "解密错误",
            msg: e.message
        };
    }

}


///数组去重
const unique = function(arr) {
    var res = [];
    var json = {};
    for (var i = 0; i < arr.length; i++) {
        if (!json[arr[i]]) {
            res.push(arr[i]);
            json[arr[i]] = 1;
        }
    }
    return res;

}
module.exports = { getShortUrl, format, md5, isValid, getConditionString, encode, decode, isRealNum, rectx, isPoneAvailable, MathRand, unique }