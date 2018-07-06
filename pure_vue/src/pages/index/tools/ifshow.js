import storage from './storage';
import Interface from '../interface';
export default show => {
  let p = storage.get('showPermission');
  for (let key in show) {
    show[key] = !!p[Interface[key].url];
  }
  return show;
}