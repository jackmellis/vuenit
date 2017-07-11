var hasOwnProperty = Object.hasOwnProperty;
var defineProperty = Object.defineProperty;
var defineProperties = Object.defineProperties;
var objectToString = Object.prototype.toString;

exports.hasOwn = function (obj, name) {
  return hasOwnProperty.call(obj, name);
};

exports.define = function (obj, name, definition) {
  return defineProperty(obj, name, definition);
};

exports.defineMany = function (obj, properties) {
  return defineProperties(obj, properties);
};

exports.defineGetter = function (obj, name, getter, overwritable) {
  var definition = {};
  definition.enumerable = definition.configurable = true;
  definition.get = getter;
  if (overwritable){
    definition.set = function (v) {
      exports.define(this, name, {
        enumerable : true,
        configurable : true,
        writable : true,
        value : v
      });
    };
  }
  return exports.define(obj, name, definition);
};

exports.defineGetters = function (obj, getters) {
  var properties = {};
  Object.keys(getters).forEach(function (key) {
    var definition = {};
    definition.enumerable = definition.configurable = true;
    definition.get = getters[key];
    properties[key] = definition;
  });
  return exports.defineMany(obj, properties);
};

exports.isElement = function (obj) {
  return !!(obj && obj.nodeType === 1 && obj.cloneNode);
};

exports.isObject = function (obj) {
  return obj && objectToString.call(obj) === '[object Object]';
};
