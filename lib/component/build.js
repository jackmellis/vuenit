var optionsMethods = require('./options');
var mockComponent = require('.');

function build(component, options) {
  options = optionsMethods.mergeOptions(options, mockComponent.config);

  function mount(options2) {
    options2 = merge(options, options2);
    return mockComponent(component, options2);
  }
  Object.defineProperty(mount, 'build', {
    value : function (options2) {
      options2 = merge(options, options2);
      return build(component, options2);
    }
  });
  Object.keys(options).forEach(function (key) {
    if (!mount[key]){
      Object.defineProperty(mount, key, {
        get : function () {
          return options[key];
        },
        set : function (v) {
          options[key] = v;
        }
      });
    }
  });

  return mount;
}

function isObject(obj) {
  return obj && Object.prototype.toString.call(obj) === '[object Object]';
}

function merge(a, b) {
  // merge is never called in a situation where a may be undefined
  // it will always be an object containing all of vuenit's possible configuration options

  var result = {};

  Object.keys(a).forEach(function (key) {
    var current = a[key];
    if (isObject(current)){
      result[key] = Object.assign({}, current);
    }else{
      result[key] = current;
    }

    if (!b || !Object.hasOwnProperty.call(b, key)){
      return;
    }

    var value = b[key];
    if (isObject(value)){
      result[key] = Object.assign({}, result[key], value);
    }else{
      result[key] = value;
    }
  });
  return result;
}

module.exports = build;
