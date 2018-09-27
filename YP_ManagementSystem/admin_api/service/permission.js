const redis = require('../middler/redis');
const query = require('../middler/mysql');
const permissionSql = require('../sql/permission');

exports.setPermissionListToRedis = async function getPermissionFunc(session) {
    let permissionObj = {};
    var permissionResult = await query.query(permissionSql.getAllValidPermission);
    if (permissionResult.code && permissionResult.result.length > 0) {

        permissionResult.result.forEach(function (item) {
            if (item.Url) {
                permissionObj[item.Url.toLowerCase()] = true;
            }
        })
        await redis.set('allPermission', '$jdspbpermissionlist$', JSON.stringify(permissionObj));
    }
    return permissionObj;
}