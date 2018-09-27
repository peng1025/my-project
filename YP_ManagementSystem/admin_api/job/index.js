const redis = require('../middler/redis');
const permission = require('../service/permission')//加载权限到redis
async function init() { //多进程的时候，只有一个进程处理
    let one = await redis.setnx(process.env.name || 'redis', +new Date(), 10);
    console.log(process.env, process.env.name, one);
    if (one.success) {
        if (one.data == 1) {
            //把所有job任务初始化在此添加即可
            console.log("hello world")
            require('./deleteExpireSession.js');
            permission.setPermissionListToRedis();
        }
    } else {
        console.log('setnx单进程设置值失败，请检查redis程序');
    }
}
init();