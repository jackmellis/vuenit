var hasOwnProperty = Object.hasOwnProperty;
var defineProperty = Object.defineProperty;

exports.hasOwn = function (obj, name) {
  return hasOwnProperty.call(obj, name);
};

exports.define = function (obj, name, definition) {
  return defineProperty(obj, name, definition);
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

exports.isElement = function (obj) {
  return !!(obj && obj.nodeType === 1 && obj.cloneNode);
};
