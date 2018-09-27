const tool = {
  isValid: function (data) {
    if (typeof (data) != "undefined" && data != null && data != 'null' && !(data === '')) {
      return true;
    } else {
      return false;
    }
  },
  getValue: function (data, defaultData) {
    return tool.isValid(data) ? data : defaultData;
  },
  isArray: function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';//A instanceof B :检测B.prototype是否存在于参数A的原型链上
  },
  getType: function (x) {
    if (x == null) {
      return "null";
    }
    var t = typeof x;
    if (t != "object" && t != 'Object') {
      return t;
    }
    if (tool.isArray(x)) {
      return 'Array';
    }
    var c = Object.prototype.toString.apply(x);
    c = c.substring(8, c.length - 1);
    if (c != "Object") {
      return c;
    }
    if (x.constructor == Object) {
      return c;
    }
    if (x.prototype && "classname" in x.prototype.constructor
      && typeof x.prototype.constructor.classname == "string") {
      return x.constructor.prototype.classname;
    }
    return "ukObject";
  },
  merge: function () {
    var _clone = function (source) {
      switch (tool.getType(source)) {
        case 'Object':
        case 'object':
          return _merge({}, source);
          break;
        case 'array':
        case 'Array':
          var aim = [];
          for (var i in source) {
            aim.push(_clone(source[i]));
          }
          return aim;
        default:
          return source;
          break;
      }
    };
    var _merge = function (aim, source) {
      if (!(typeof (source) == 'object' && !tool.isArray(source))) { return aim; }
      for (var i in source) {
        if (source[i] != undefined) {
          if (!tool.isValid(aim[i])) {
            aim[i] = _clone(source[i]);
          } else {
            switch (tool.getType(aim[i])) {
              case 'object':
              case 'Object':
                _merge(aim[i], source[i]);
                break;
              case 'Array':
                //处理数组
                var hasmergeIndex = false;
                for (var i3 = 0, k = source[i][i3]; i3 < source[i].length; i3++ , k = source[i][i3]) {
                  if (typeof (k.mergeIndex) == "number") {
                    hasmergeIndex = true;
                    if (aim[i].length < (k.mergeIndex + 1)) {
                      aim[i].push(k);
                    } else {
                      aim[i][i3] = _merge(aim[i][i3], k);
                    }
                  } else if (typeof (k.moveIndex) == "number") {
                    hasmergeIndex = true;
                    aim[i].splice(k.moveIndex, 0, k);
                  }
                }
                if (!hasmergeIndex) {
                  aim[i] = _clone(source[i]);
                }
                break;
              default:
                aim[i] = source[i];
                break;
            }
          }
        }
      }
      return aim;
    };
    var argu = arguments;
    if (argu.length < 2) { return argu[0] ? argu[0] : {} };
    if (argu.length > 0 && true == argu[argu.length - 1]) {
      var _ = argu[0];
      for (var i2 = 1; i2 < argu.length; i2++)
        _ = _merge(_, argu[i2]);
      return _;
    } else {
      var _ = {};
      for (var i2 = 0; i2 < argu.length; i2++)
        _ = _merge(_, argu[i2]);
      return _;
    }
  },
  //获取cookie、
  getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
      return (arr[2]);
    else
      return null;
  },

  //设置cookie,增加到vue实例方便全局调用
  setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
  },

  //删除cookie
  delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null)
      document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
  },
}
export default tool;