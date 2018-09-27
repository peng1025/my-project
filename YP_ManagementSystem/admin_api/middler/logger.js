const log4js = require('log4js');
const envConfig = require('../dev.cnf');
const path = require('path');
let folder = path.join(__dirname, '../', envConfig.log.folder);
log4js.configure({
    appenders: {
        console: {
            type: 'console'
        }, //控制台输出
        logInfo: {
            type: "dateFile",
            filename: folder + 'info-',
            pattern: "yyyyMMdd-hh.log",
            // absolute: false,
            alwaysIncludePattern: true,
            maxLogSize: 20971520, //单位字节
            numBackups: 3,

        }, //日期文件格式
        logError: {
            type: "dateFile",
            filename: folder + 'error-',
            pattern: "yyyyMMdd-hh.log",
            // absolute: false,
            alwaysIncludePattern: true,
            maxLogSize: 20971520,
            numBackups: 3,
            category: 'logError'

        }, //日期文件格式
        logControlInfo: {
            type: "dateFile",
            filename: folder + 'control/info-',
            pattern: "yyyyMMdd-hh.log",
            // absolute: false,
            alwaysIncludePattern: true,
            maxLogSize: 20971520,
            numBackups: 3,
            category: 'logControlInfo'

        }, //日期文件格式
        logControlError: {
            type: "dateFile",
            filename: folder + 'control/error-',
            pattern: "yyyyMMdd-hh.log",
            // absolute: false,
            alwaysIncludePattern: true,
            maxLogSize: 20971520,
            numBackups: 3,
            category: 'logControlError'

        } //日期文件格式
    },
    //replaceConsole: envConfig.log.debug, //替换console.log
    // levelsss: {
    //     logInfo: 'info', //info及以上级别输出到日志文件
    //     console: 'debug' //debug及以上级别输出到控制台
    // },
    categories: {
        default: { appenders: ["console"], level: 'all' },
        logControlInfo: { appenders: ['logControlInfo'], level: 'info' },
        logControlError: { appenders: ['logControlError'], level: 'error' },
        logInfo: { appenders: ['logInfo'], level: 'info' },
        logError: { appenders: ['logError'], level: 'error' }
    },
    pm2: true
});
const logobj = {
    logConsole: log4js.getLogger('console'),
    logInfo: log4js.getLogger('logInfo'),
    logError: log4js.getLogger('logError'),
    logControlInfo: log4js.getLogger('logControlInfo'),
    logControlError: log4js.getLogger('logControlError')
}
module.exports = {
    Info: function (content, category) {
        try {
            if (content) {
                let category1 = "logInfo";
                if (category) {
                    switch (category) {
                        case "control":
                            category1 = "logControlInfo";
                            break;
                    }
                }
                if (envConfig.log.debug) {
                    logobj.logConsole.debug(content + '</br>');
                } else {
                    logobj[category1].info(content + '</br>');
                }

            }
        } catch (e) {
            console.log('log4错误：' + e);
        }

    },
    Error: function (content, category) {
        try {
            if (content) {
                let category1 = "logInfo";
                if (category) {
                    switch (category) {
                        case "control":
                            category1 = "logControlInfo";
                            break;
                    }
                }
                if (envConfig.log.debug) {
                    logobj.logConsole.debug(content + '</br>');
                } else {
                    logobj[category1].error(content + '</br>');
                }
            }
        } catch (e) {
            console.log('log4错误：' + e);
        }
    }
}
    // const logger = log4js.getLogger('logInfo');
    // const logger2 = log4js.getLogger('console');

// logger2.debug('hello 校的事发生');
// logger.trace('Entering cheese testing');
// logger.debug('Got cheese.');
// logger.info('Cheese is Gouda.');
// logger.warn('Cheese is quite smelly.');
// logger.error('Cheese is too ripe!');
// logger.fatal('盛大发售');