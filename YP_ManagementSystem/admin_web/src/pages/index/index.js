// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App';
import VueRouter from 'vue-router';
import routes from '../../router';
import ajax from '../../tools/ajax.js';
import storage from '../../tools/storage.js';
import ifshow from '../../tools/ifshow.js';
import dynamicRouter from '../../tools/dynamicRouter.js';
import getDic from '../../tools/dictionary.js';
import * as filters from '../../assets/filters.js';
import myTable from '../../components/table.vue'

Vue.component('my-table', myTable)
Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(ElementUI,{ size: 'small'});
Vue.prototype.ajax = ajax;
Vue.prototype.storage = storage;
Vue.prototype.ifshow = ifshow;
Vue.prototype.dynamicRouter = dynamicRouter;
Vue.prototype.getDic = getDic;
const router = new VueRouter(routes);
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

router.beforeEach((to, from, next) => {
  window.scroll(0, 0);
  let pubPage = ['/home'];
  if ((to.path != '/pagelogin')) {
    let obj = storage.get('userInfo');
    let per = storage.get('userPermission');
    let perlist = ["/", "/pagelogin"];
    if (!!per.length) {
      for (let i of per) {
        perlist.push(i.Url);
      }
    }
    if (!obj.name) {
      // Vue.prototype.$message({
      //   message: '请先登录！', type: 'warning'
      // });
      next({ path: '/pagelogin', query: { url: to.fullPath } });// 无权访问
    } else if (perlist.indexOf(to.path) === -1 && pubPage.indexOf(to.path) === -1) {
      Vue.prototype.$message({
        message: '您没有这个权限！', type: 'warning'
      });
      next({ path: from.fullPath });// 无权访问
    } else {
      next();
    }
  } else {
    next();
  }
})
//刷新页面后Vue会重新渲染，所以需再次绑定路由。
dynamicRouter();
router.addRoutes(router.options.routes);
new Vue({
  el: '#app',
  router,
  components: { App },
  // created() {
  //   this.$router.push('/home'); // 页面加载时跳转
  // },
  template: '<App/>'
})
export default router;
