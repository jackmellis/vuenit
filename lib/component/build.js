var optionsMethods = require('./options');
var mockComponent = require('.');
var helpers = require('../helpers');
var hasOwn = helpers.hasOwn;
var define = helpers.define;
var isObject = helpers.isObject;
var assign = helpers.assign;

function build(component, options) {
  options = optionsMethods.mergeOptions(options, mockComponent.config);

  function mount(options2) {
    options2 = merge(options, options2);
    return mockComponent(component, options2);
  }
  define(mount, 'build', {
    value : function (options2) {
      options2 = merge(options, options2);
      return build(component, options2);
    }
  });
  Object.keys(options).forEach(function (key) {
    if (!mount[key]){
      define(mount, key, {
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

function merge(a, b) {
  // merge is never called in a situation where a may be undefined
  // it will always be an object containing all of vuenit's possible configuration options

  var result = {};

  Object.keys(a).forEach(function (key) {
    var current = a[key];
    if (isObject(current)){
      result[key] = assign({}, current);
    }else{
      result[key] = current;
    }

    if (!b || !hasOwn(b, key)){
      return;
    }

    var value = b[key];
    if (isObject(value)){
      result[key] = assign({}, result[key], value);
    }else{
      result[key] = value;
    }
  });
  return result;
}

module.exports = build;
