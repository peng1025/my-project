import Vue from 'vue'
// import VueRouter from 'vue-router'
import Upload from './upload.vue'
// import "./static/h5css/main.css"
import ajax from '../index/tools/ajax'
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
import 'element-ui/lib/theme-chalk/index.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';


// Vue.use(VueRouter);
Vue.use(MintUI);
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
  el: "#upload",
  // router,
  render: h => h(Upload)
})
