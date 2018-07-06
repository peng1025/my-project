import Vue from 'vue'

import ajax from '../index/tools/ajax'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import excelOperation from './excelOperation.vue'

Vue.use(ElementUI);
Vue.config.productionTip = false;
Vue.prototype.ajax = ajax;

// 创建一个路由器实例
// 并且配置路由规则
// const router = new VueRouter({
//   mode: 'history',
//   // base: baseUrl,
//   routes: [
//     // {
//     //   path: '/',
//     //   component: Upload
//     // },
//   ]
// })
// 现在我们可以启动应用了！
// 路由器会创建一个 App 实例，并且挂载到选择符 #index 匹配的元素上。
/* eslint-disable no-new */
new Vue({
  el: "#excelId",
  // router,
  render: h => h(excelOperation)
})
