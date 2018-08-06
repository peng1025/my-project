import Vue from 'vue'

import ajax from '../index/tools/ajax'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import editor from './orderDetail.vue'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(ElementUI);
Vue.config.productionTip = false;
Vue.prototype.ajax = ajax;

new Vue({
  el: "#editorId",
  // router,
  render: h => h(editor)
})
