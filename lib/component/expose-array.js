var define = require('../helpers').define;
var arrayMethods = {};
[
  'every', 'fill', 'filter', 'find', 'findIndex',
  'forEach', 'includes', 'indexOf', 'join',
  'lastIndexOf', 'map', 'pop', 'push', 'reduce',
  'reduceRight', 'reverse', 'shift', 'slice',
  'some', 'sort', 'splice', 'unshift'
].forEach(function (key) {
  arrayMethods[key] = {
    value : Array.prototype[key]
  };
});
function exposeArray(arr) {
  var l = arr.length;
  if (!l){
    return arr;
  }
  var element = arr[0];
  // create a prototype object that uses the first array element as its prototype
  // and the array methods as its properties
  // keep in mind:
  // arrayLike instanceof HTMLElement -> true
  // arrayLike instanceof Array -> false
  var proto = Object.create(element, arrayMethods);
  var arrayLike = Object.create(proto);
  define(arrayLike, 'length', {
    writable : true,
    configurable : true,
    value : l
  });
  // proxy all of the element's properties
  // if we simply inherit prototype methods, some libraries like jsdom
  // throw a hissy fit because the method is being called on a descendant of a
  // html element, instead of directly on the element itself
  for (var y in element) {
    (function(y){
      if (typeof element[y] === 'function') {
        arrayLike[y] = function () {
          return element[y].apply(element, arguments);
        };
      } else {
        define(arrayLike, y, {
          get: function () {
            return element[y];
          },
          set: function (v) {
            element[y] = v;
          }
        });
      }
    }(y));
  }
  // add the rest of the array elements to our arrayLike
  for (var x = 0; x < l; x++){
    arrayLike[x] = arr[x];
  }
  return arrayLike;
}

module.exports = exposeArray;
