import axios from 'axios';
import Interface from '../interface';
import tool from './tool';
import storage from './storage';
import router from '../router/index'

// axios 配置
axios.defaults.timeout = 30000;//请求超时，适当修改

export default function (name, params, callback) {
  // if (name !== '登录' && !sessionStorage.getItem('loginToken')) {
  //   router.push("/login");
  //   return;
  // }
  let action = Interface[name];
  // if (!action['jsonp']) {
  if (!action.responseType) {
    axios[action.method](
      action.url,
      action.method === "post" ? params : { params: tool.merge(params, action.params) },
    ).then((res) => {
      if (res.status === 200) {
        if (res.data.code === 200) {
          callback(res.data);
        } else if (res.data.code === 401) {
          storage.remove('userInfo');
          router.push("/login");
        } else if (res.data.code === 500) {
          callback(null, { msg: '系统错误,请联系管理员!错误码:500' });
        } else {
          callback(null, { msg: res.data.msg, code: res.data.code });
        }
      } else {
        callback(null, { msg: '系统错误,请联系管理员!错误码:' + res.status });
      }
    }).catch((err) => {
      if (!err.response) {
        callback(null, { msg: '系统错误,请联系管理员:' + err });
      } else if (err.response.status === 401) {
        storage.remove('userInfo');
        router.push("/login");
      } else {
        callback(null, { msg: '系统错误,请联系管理员!错误码:' + err.response.status });
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
        let filename = res.headers['content-disposition'].split("filename=")[1];
        callback({ code: 200, data: res.data, filename: filename });
      } else {
        callback(null, { msg: '系统错误,请联系管理员!错误码:' + res.status });
      }
    }).catch((err) => {
      if (!err.response) {
        callback(null, { msg: '系统错误,请联系管理员:' + err });
      } else if (err.response.status === 401) {
        storage.remove('userInfo');
        router.push("/login");
      } else {
        callback(null, { msg: '系统错误,请联系管理员!错误码:' + err.response.status });
      }
    });
  }
  // } else {
  //   // 暂时不解决跨域问题
  // }
}