import dic from '../model/dic';

//订单模板导出
export async function getDic(ctx, next) {
    try {
        var key = ctx.request.body.key;
        var obj = dic[key];
        var res = [];
        if (obj) {
            for (var k in obj) {
                res.push({ ID: k, Name: obj[k] });
            }
        }
        ctx.body = {
            code: 200,
            data: res
        };
        return;
    } catch (e) {
        logger.Error('/login/getDic异常：' + e.message, 'control');
        ctx.body = {
            code: 500,
            msg: e.message
        }
    }
}