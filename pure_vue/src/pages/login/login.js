import Vue from 'vue';
import ajax from '../index/tools/ajax';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import login from './login.vue'


Vue.use(ElementUI);
Vue.config.productionTip = false;
Vue.prototype.ajax = ajax;

new Vue({
  el: "#login",
  // router,
  render: h => h(login)
})
