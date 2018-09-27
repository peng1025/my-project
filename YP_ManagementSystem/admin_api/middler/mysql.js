const mysql = require('mysql');
const envConfig = require('../dev.cnf');
const pool = mysql.createPool({
    host: envConfig.mysql.HOST,
    user: envConfig.mysql.USERNAME,
    password: envConfig.mysql.PASSWORD,
    database: envConfig.mysql.DATABASE,
    port: envConfig.mysql.PORT,
    multipleStatements: true
});
//query('sel where id={id}',{id:'343'});
let query = async function(sql, values) {
    //当参数是对象类型时，说明需要参数化
    if (values && Object.prototype.toString.call(values) === '[object Object]') {
        sql = queryFormat(sql, values);
        values = undefined;
    }
    return new Promise((resolve, reject) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                resolve({ code: false, message: err.message })
            } else {
                connection.query(sql, values, (err, rows) => {

                    if (err) {
                        resolve({ code: false, message: err.message })
                    } else {
                        resolve({ code: true, result: rows })
                    }
                    connection.release()
                })
            }
        })
    })
}
class Transaction {
    constructor(config) {
        this._connection = null;
    }

    start() {
        let _this = this;
        return new Promise(function(resolve, reject) {
            pool.getConnection(function(err, connection) {
                if (err) {
                    resolve({ code: false, msg: "创建连接失败", message: err.message })
                } else {
                    _this._connection = connection;
                    _this._connection.beginTransaction(function(error) {
                        if (error) {
                            return reject({ code: false, msg: "创建事务失败", message: error.message });
                        }
                        return resolve({ code: true });
                    });
                }
            });
        });
    }

    execute(sql, values) {
        let _this = this;
        //当参数是对象类型时，说明需要参数化
        if (values && Object.prototype.toString.call(values) === '[object Object]') {
            sql = queryFormat(sql, values);
            values = undefined;
        }
        return new Promise(function(resolve, reject) {
            _this._connection.query(sql, values, (err, rows) => {
                if (err) {
                    resolve({ code: false, message: err.message })
                } else {
                    resolve({ code: true, result: rows })
                }
            });
        });
    }

    commit() {
        let _this = this;
        return new Promise(function(resolve, reject) {
            _this._connection.commit(function(error) {
                if (error) {
                    return _this._connection.rollback(function() {
                        resolve({ code: false, message: error.message })
                        _this._connection.release();
                    });
                }
                resolve({ code: true });
                _this._connection.release();
            });
        });
    }
    rollback() {
        let _this = this;
        return new Promise(function(resolve, reject) {
            _this._connection.rollback(function() {
                resolve({ code: true });
                _this._connection.release();
            });
        });
    }
}
let escapeSql = function(str) {
        return mysql.escape(str);
        //return mysql.escape(str).replace(/'/g, '');
    }
    //mysql中间件专用序列化参数
let queryFormat = function(query, values) {
    return query.replace(/\{[^(})]+\}/gi, function(word) {
        let value = values['' + word.replace(/\{/g, '').replace(/\}/g, '')];
        if (value !== 0) {
            if (value === null || value === undefined) {
                value = null;
            } else {
                value = value || '';
            }
        }
        if (typeof value === 'string') {
            return escapeSql(value);
        }
        return value;
    });
}
module.exports = { query, Transaction, escapeSql }
    /*
    let trans=new Transaction();  //new一个事务
    let r=await trans.start();开户事务
    let sql1=await trans.execute(sql,values);//执行sql
    if(!sql1.code){
       await trans.rollback();  //回滚
        return;
    }
    let sql2=await trans.execute(sql2,values);
         await trans.commit();  //提交
    */