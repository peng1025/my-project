var db = {};
var redis = require("redis");
const env = require('../dev.cnf');
var client = redis.createClient(env.redis.port, env.redis.host, { db: env.redis.select_db || 0 });
if (env.redis.auth) {
    client.auth(env.redis.auth);
}
client.on("error", function(err) {
    console.log("redisError :", err);
});

client.on('connect', function() {
    console.log('Redis连接成功.');
})

/** 
 * 添加string类型的数据 
 * @param key 键 
 * @params value 值  
 * @params expire (过期时间,单位秒;可为空，为空表示不过期) 
 * @param callBack(err,result) 
 */
db.set = async function(table, key, value = '') {
    return new Promise((resolve, reject) => {
        let code = env.redis.table[table].code;
        if (typeof table === 'string' && typeof key === 'string' && code) {} else {
            resolve({
                success: false,
                msg: "参数必需是字符串"
            })
            return;
        }
        let keys = code + "-" + key;
        client.set(keys, value, function(err, result) {

            if (err) {
                console.log(err);
                resolve({
                    success: false,
                    msg: "插入失败",
                    message: err.message
                })
                return;
            }
            if (env.redis.table[table].expire) {
                let expire = env.redis.table[table].expire;
                if (!isNaN(expire) && expire > 0) {
                    client.expire(keys, parseInt(expire));
                }
            }
            resolve({
                success: true,
                msg: ""
            })
        })
    });

}

/** 
 * 查询string类型的数据 
 * @param key 键 
 * @param callBack(err,result) 
 */
db.get = function(table, key) {
    return new Promise((resolve, reject) => {
        let code = env.redis.table[table].code;
        if (typeof table === 'string' && typeof key === 'string' && code) {} else {
            resolve({
                success: false,
                msg: "参数必需是字符串"
            })
            return;
        }
        client.get(code + "-" + key, function(err, result) {

            if (err) {
                console.log(err);
                resolve({
                    success: false,
                    msg: "查询失败",
                    message: err.message
                })
                return;
            }
            resolve({
                success: true,
                data: result
            })
        });
    });
}
db.delete = function(table, key) {
        return new Promise((resolve, reject) => {
            let code = env.redis.table[table].code;
            if (typeof table === 'string' && typeof key === 'string' && code) {} else {
                resolve({
                    success: false,
                    msg: "参数必需是字符串"
                })
                return;
            }
            let expire = env.redis.table[table].expire;
            if (!isNaN(expire) && expire > 0) {
                client.expire(code + "-" + key, 1);
            }
            resolve({
                success: true,
                msg: ""
            })
        });
    }
    /**
     * 设置一个值并加锁，其它进程或线程不能重新设置值，设置成功data=1，设置失败，data=0
     */
db.setnx = (key, value, expire = 10) => {
    return new Promise((resolve, reject) => {
        client.setnx(key, value, function(err, result) {
            if (err) {
                resolve({
                    success: false,
                    msg: "设置失败",
                    message: err.message
                })
                return;
            }
            client.expire(key, parseInt(expire));
            resolve({
                success: true,
                data: result
            })
        });
    });
}
module.exports = { set: db.set, get: db.get, delete: db.delete, setnx: db.setnx };