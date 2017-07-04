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
  // create a prototype object that uses the first array element as its prototype and the array methods as its properties
  var proto = Object.create(arr[0], arrayMethods);
  var arrayLike = Object.create(proto);
  Object.defineProperty(arrayLike, 'length', {
    writable : true,
    configurable : true,
    value : l
  });
  for (var x = 0; x < l; x++){
    arrayLike[x] = arr[x];
  }
  return arrayLike;
}

module.exports = exposeArray;
