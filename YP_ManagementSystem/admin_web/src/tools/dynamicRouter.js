import storage from './storage';
import router from '../router/index'
export default function () {
  let permissions = storage.get("userPermission");
  if (permissions.length > 0) {
    let modules = permissions.filter(item => { return item.Type === 0 });
    let pages = permissions.filter(item => { return item.Type === 1 });
    for (let i of modules) {
      for (let j of pages) {
        if (j.ParentID === i.ID) {
          //插入路由
          router.routes[2].children.push({
            path: j.Url,
            component: () => import(`../pages${i.Url}${j.Url}.vue`)
          });
        }
      }
    }
  }
};
// function importComponent(path) {
//   return resolve => require([`../pages${path}`], resolve)
// }