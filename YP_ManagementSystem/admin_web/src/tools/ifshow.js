import storage from './storage.js';
import Interface from '../interface.js';
export default show => {
  let p = storage.get('showPermission');
  for (let key in show) {
    show[key] = !!p[Interface[key].url] ? p[Interface[key].url].hasRight : true;
  }
  return show;
}