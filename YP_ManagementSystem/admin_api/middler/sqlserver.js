var sqlserver = require('mssql');
const env = require('../dev.cnf');
var dbConfig = {
    server: env.sqlserver.server,
    database: env.sqlserver.database,
    user: env.sqlserver.user,
    password: env.sqlserver.password,
    port: env.sqlserver.port
};
var db = function(strsql) {
    return new Promise((resolve, reject) => {
        sqlserver.connect(dbConfig).then(function() {
                var req = new sqlserver.Request().query(strsql).then(function(recordset) {
                        resolve({ code: true, result: recordset })
                    })
                    .catch(function(err) {
                        console.log(err);
                        resolve({ code: false, message: err.message })
                    });
            })
            .catch(function(err) {
                console.log(err);
                resolve({ code: false, message: err.message })
            });
    });
};
module.exports = db;