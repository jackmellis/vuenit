var injector = require('vue-inject');

module.exports = function (config) {
  var $promise = injector.spawn(true).get('$promise');

  function findMatchingRequest(request) {
    var method = request.method.toLowerCase(), url = request.url.toLowerCase(), $$when = http.$$when;

    if (http.latestWins){
      $$when = $$when.slice().reverse();
    }

    for (var x = 0, l = $$when.length; x < l; x++){
      var when = $$when[x];
      if (when.method instanceof RegExp){
        if (!when.method.test(method)){
          continue;
        }
      }else if (when.method !== method){
        continue;
      }

      if (when.url instanceof RegExp){
        if (!when.url.test(url)){
          continue;
        }
      }else if (when.url !== url){
        continue;
      }

      return when;
    }
  }

  function http(options){
    options = Object.assign({method : 'get'}, options);

    var when = findMatchingRequest(options);

    var promise = $promise.resolve().then(function () {
      if (!when){
        if (http.strict){
          throw new Error('Unexpected ' + options.method + ': ' + options.url);
        }else{
          return;
        }
      }

      if (when.callback){
        return when.callback(options);
      }
    });

    http.$$requests.push(promise);

    if (http.immediate && promise.flush){
      promise.flush();
    }

    return promise;
  }
  http.get = function (url, options) {
    options = Object.assign({method : 'GET'}, options, {url : url});
    return http(options);
  };
  http.delete = function (url, options) {
    options = Object.assign({method : 'DELETE'}, options, {url : url});
    return http(options);
  };
  http.options = function (url, options) {
    options = Object.assign({method : 'OPTIONS'}, options, {url : url});
    return http(options);
  };
  http.post = function (url, data, options) {
    options = Object.assign({method : 'POST'}, options, {url : url, data : data});
    return http(options);
  };
  http.put = function (url, data, options) {
    options = Object.assign({method : 'PUT'}, options, {url : url, data : data});
    return http(options);
  };
  http.patch = function (url, data, options) {
    options = Object.assign({method : 'PATCH'}, options, {url : url, data : data});
    return http(options);
  };
  http.when = function (method, url) {
    var any = /.*/;
    if (method === undefined && url === undefined){
      method = url = any;
    }else if (method === undefined){
      method = any;
    }else if (url === undefined){
      url = method;
      method = any;
    }

    if (typeof method === 'string'){
      method = method.toLowerCase();
    }
    if (typeof url === 'string'){
      url = url.toLowerCase();
    }

    var when = {
      method : method,
      url : url,
      callback : undefined
    };

    this.$$when.push(when);

    return {
      return : function (value) {
        when.callback = function(){
          return value;
        };
        return this;
      },
      call : function (cb) {
        when.callback = cb;
        return this;
      },
      stop : function () {
        when.callback = function(){
          return $promise(function(){});
        };
        return this;
      },
      throw : function(value){
        return this.reject(value);
      },
      reject : function (value) {
        when.callback = function(){
          return $promise.reject(value);
        };
        return this;
      }
    };
  };
  http.otherwise = function () {
    this.$$when.reverse();
    var result = this.when();
    this.$$when.reverse();
    return result;
  };
  http.$$when = [];
  http.$$requests = [];
  http.strict = true;
  http.latestWins = true;
  http.immediate = false;
  http.flush = function () {
    this.$$requests.forEach(function (request) {
      if (request.flush){
        request.flush();
      }
    });
  };

  if (typeof config === 'function'){
    config(http);
  }

  return http;
};
