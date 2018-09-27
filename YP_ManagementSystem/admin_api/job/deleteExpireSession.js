//1清理会话过期的数据
var schedule = require('node-schedule');
const sql = require('../sql/schedule');
const logger = require('../middler/logger');
const { query } = require('../middler/mysql');
const tool = require('../middler/tool');
var managetmprule = new schedule.RecurrenceRule();
managetmprule.minute = [0, 15, 30, 45];
// var minute = [];
// for (var i = 0; i < 60; i++) {
//     minute.push(i);
// }
// managetmprule.minute = minute;
let goOn = true;
let mtjob = schedule.scheduleJob(managetmprule, async function () {
  if (goOn) {
    goOn = false;
    try {
      await deleteSessionExpired();
    } catch (e) {
      logger.Error('job.deleteExpireSession外---异常：' + e.message);
    }

    goOn = true;
  } else {
    logger.Info('job/deleteSessionExpired---上一个还没执行完');
  }
});
async function deleteSessionExpired() {
  try {
    let result = await query(tool.format(sql.deleteSessionExpired, { time: (new Date().getTime() - 5) }));
    if (result.code) {
    }
    else {
      logger.Error('job/deleteSessionExpired异常：' + result.message);
    }
  } catch (e) {
    logger.Error('job/deleteSessionExpired异常：' + e.message);
  }
}