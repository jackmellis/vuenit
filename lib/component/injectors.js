var mockStore = require('../store');
var mockHttp = require('../http');
var reactify = require('../reactify');

exports.injectStore = function(options) {
  if (options.store){
    options.store = mockStore(options.store);
    options.inject.$store = options.store;
  }
};

exports.injectHttp = function(options) {
  if (options.http){
    var $http = (options.http === true) ? mockHttp() : options.http;
    options.inject.$http = function(){
      return $http;
    };
  }
};

exports.parseDependencies = function(options) {
  var injector = options.injector;
  var deps = Object.keys(options.inject)
    .map(function (key) {
      var value = options.inject[key];
      if (typeof value === 'function'){
        injector.factory(key, value);
      }else{
        injector.constant(key, value);
      }
      return key;
    });

  if (deps.length){
    options.inject = reactify(options.inject);
  }

  return deps;
};