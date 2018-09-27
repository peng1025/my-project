import axios from 'axios';
import Interface from '../interface.js';
import tool from './tool.js';
import storage from './storage.js';
import router from '../pages/index/index.js'

// axios 配置
axios.defaults.timeout = 30000;//请求超时，适当修改

export default function (name, params, callback) {
  // if (name !== '登录' && !sessionStorage.getItem('loginToken')) {
  //   router.push("/login");
  //   return;
  // }
  let action = Interface[name];
  if (!action) {
    callback(null, { msg: '未找到接口,请联系管理员!' });
    return;
  }
  // if (!action['jsonp']) {
  if (!action.responseType) {
    axios[action.method](
      action.url,
      action.method === "post" ? params : { params: tool.merge(params, action.params) },
    ).then((res) => {
      if (res.status === 200) {
        switch (res.data.code) {
          case 200:
            callback(res.data);
            break;
          case 401:
            storage.remove('userInfo');
            router.push("/pagelogin");
            break;
          case 500:
            callback(null, { msg: '系统错误,请联系管理员!错误码:500' });
            break;
          case 400:
            callback(null, { msg: res.data.msg || res.data.message || "操作失败，请重试" });
            break;
          case 402:
            callback(null, { data: res.data });//返回异常数据，例如：导入时哪些数据因为什么失败这种情况返回402。
          default:
            callback(null, { code: res.data.code, msg: "此次操作错误，错误代码：" + res.data.code });
            break;
        }
        // if (res.data.code === 200) {
        //   callback(res.data);
        // } else if (res.data.code === 401) {
        //   storage.remove('userInfo');
        //   router.push("/login");
        // } else if (res.data.code === 500) {
        //   callback(null, { msg: '系统错误,请联系管理员!错误码:500' });
        // } else {
        //   callback(null, { msg: res.data.msg, code: res.data.code, data: res.data });
        // }
      } else {
        callback(null, { msg: '系统错误,请联系管理员!错误码:--' + res.status });
      }
    }).catch((err) => {
      if (!err.response) {
        callback(null, { msg: '系统错误,请联系管理员:' + err });
      } else if (err.response.status === 401) {
        storage.remove('userInfo');
        router.push("/pagelogin");
      } else {
        callback(null, { msg: '系统错误,请联系管理员!错误码:--' + err.response.status });
      }
    });
  } else {
    axios({ // 用axios发送post请求
      method: action.method,
      url: action.url, // 请求地址
      data: params, // 参数
      responseType: action.responseType // 表明返回服务器返回的数据类型
    }).then((res) => { // 处理返回的文件流
      if (res.status === 200) {
        if (!!res.headers['content-disposition']) {
          let filename = res.headers['content-disposition'].split("filename=")[1];
          callback({ code: 200, data: res.data, filename: filename });
        } else {
          callback(null, { msg: '系统错误,请联系管理员!' });
        }
      } else {
        callback(null, { msg: '系统错误,请联系管理员!错误码:' + res.status });
      }
    }).catch((err) => {
      if (!err.response) {
        callback(null, { msg: '系统错误,请联系管理员:' + err });
      } else if (err.response.status === 401) {
        storage.remove('userInfo');
        router.push("/pagelogin");
      } else {
        callback(null, { msg: '系统错误,请联系管理员!错误码:' + err.response.status });
      }
    });
  }
  // } else {
  //   // 暂时不解决跨域问题
  // }
}