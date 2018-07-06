export default {
  /**----------------------接口start----------------------*/
  '登录': {
    url: '/api/login', method: 'post',  params: {}
  },
  '登出': {
    url: '/api/signout', method: 'post',  params: {}
  },
  '修改密码': { 
    url: '/api/updatePassword', method: 'post',  params: {}
  },
  '图片上传': { 
    url: '/api/uploadImage', method: 'post',  params: {}
  },
  '图片提交': { 
    url: '/api/saveImageUrl', method: 'post',  params: {}
  },
  '订单导出': {
    url: '/api/exportOrdersList', method: 'post', responseType: 'blob', params: {}
  },
  /**----------------------接口end----------------------*/
};