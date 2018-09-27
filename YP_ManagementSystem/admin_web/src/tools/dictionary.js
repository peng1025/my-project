import ajax from './ajax.js';
let dictionaryMap = {
  "入职状态": "empType",
  "账号类型": "accountType",
  "权限类型": "permissionType",
  "订单状态": "orderStatusModel",
  "短信发送状态": "smsStatus",
  '预知识审核状态': 'preAuditStatus'
}
export default (key, cb) => {
  ajax("查询字典", { key: dictionaryMap[key] }, (ret, err) => {
    if (!!ret.data.length) {
      for (let i of ret.data) {
        i.ID = parseInt(i.ID);
      }
    }
    cb(ret.data);
  });
}