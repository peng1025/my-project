
function importComponent(path) {
  return resolve => require([`../pages${path}`], resolve)
}
export default {
  mode: 'history',
  routes: [
    {
      path: '*',
      name: '/404',
      component: importComponent("/NoFind")
    }, {
      path: '/login',
      component: importComponent("/Login")
    },
    {
      path: '/',
      component: importComponent("/home"),
      children: []
    }
  ]
} 