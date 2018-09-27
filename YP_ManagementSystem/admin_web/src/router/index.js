
// function importComponent(path) {
//   return resolve => require([`../pages${path}.vue`], resolve)
// }
export default {
  mode: 'history',
  routes: [
    {
      path: '*',
      name: '/404',
      component: () => import('../pages/index/pages/NoFind.vue')
    }, {
      path: '/pagelogin',
      component: () => import('../pages/index/pages/Login.vue')
    },
    {
      path: '/',
      component: () => import('../pages/index/pages/home.vue'),
      children: [
        {
          path: '/home',
          component: () => import('../pages/index/pages/homePage.vue'),
        }
      ]
    }
  ]
} 