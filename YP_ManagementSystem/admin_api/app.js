const Koa = require('koa'); // 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const bodyParser = require('koa-bodyparser'); //对于POST请求的处理，koa-bodyparser中间件可以把koa2上下文的formData数据解析到ctx.request.body中
const envConfig = require('./dev.cnf'); //配置信息
const router = require('./router/index.js'); //导入路由
const path = require('path'); //用于处理路径
const static1 = require('koa-static'); // 配置静态web服务的中间件 
const fs = require('fs'); //文件处理模块
const session = require('koa-session-minimal') //适用于koa2 的session中间件，提供存储介质的读写接口 。
const MysqlStore = require('koa-mysql-session') //为koa-session-minimal中间件提供MySQL数据库的session数据读写操作。
const check = require('./middler/checkPermission') //操作权限检查
    //const koaBody = require('koa-body');  目前加了后，请求异常，一直没返回，可能原码有问题
const app = new Koa();
// session存储配置
const sessionMysqlConfig = {
        user: envConfig.mysql.USERNAME,
        password: envConfig.mysql.PASSWORD,
        database: envConfig.mysql.DATABASE,
        host: envConfig.mysql.HOST,
        port: envConfig.mysql.PORT,
    }
    // 配置session中间件
app.keys = ['spb-session-secret'];
app.use(session({
        key: 'uid',
        store: new MysqlStore(sessionMysqlConfig),
        cookie: { // 与 cookie 相关的配置
            //domain: 'localhost',    // 写 cookie 所在的域名
            // path: '/',              // 写 cookie 所在的路径
            // maxAge: 1000 * 3600 * 8, // cookie 有效时长
            httpOnly: true, // 是否只用于 http 请求中获取
            overwrite: false // 是否允许重写
        }
    }))
    // 使用中间件将结果解析到 ctx.request.body
app.use(bodyParser({
    enableTypes: ['json', 'form', 'text']
}));
// app.js的路径
// const staticPath = './public';
// app.use(static1(path.join(__dirname, staticPath)));
app.use(static1(path.join(__dirname, './public')));

// let allowPath = { "/api/login": true, "/api/regist": true, "/api/signout": true, "/api/userimport": true, "/api/getorderslist": true, "/api/uploadimage": true, "/api/saveimageurl": true, "/api/updatepassword": true };
app.use(async(ctx, next) => {
    let cpath = ctx.path.toLowerCase();
    if ((cpath.indexOf('/api/') == 0) || (cpath.indexOf('/login/') == 0)) {
        if (ctx.session && ctx.session.isLogin && ctx.session.userName) {
            return next();
        } else {
            ctx.body = {
                code: 401,
                msg: "您登陆了么？"
            };
            return;
        }
    } else {
        if (cpath.includes('/pub/')) {
            return next();
        } else
        if (cpath.trim('/').split('/').length < 3) {
            ctx.type = 'text/html';
            ctx.body = fs.createReadStream(path.resolve(__dirname, './public/index.html'));
        } else
        if (cpath.includes(envConfig.log.folder)) {
            ctx.type = 'text/html';
            ctx.body = fs.createReadStream(path.resolve(__dirname, '.' + ctx.path));
        } else {
            ctx.type = 'text/html';
            ctx.body = fs.createReadStream(path.resolve(__dirname, './public/404.html'));
        }
    }
});
app.use(check.checkPermission());
// app.use(koaBody({
//     multipart: true,
//     formidable: {
//         maxFileSize: 10485760 //10M
//     }
// })); //处理表单上传的数据大小要限制
app.use(router.routes()).use(router.allowedMethods());
app.on('error', err => {
    console.error('server error', err)
});

app.listen(envConfig.port || 3000, () => {
    console.log('程序启动端口为：' + envConfig.port || 3000);
});



//定时任务清理
async function initData() {
    //job
    require('./job/index');
}

initData();