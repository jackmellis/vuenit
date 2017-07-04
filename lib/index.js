var requireCache = {};

exports.component = exports.mount = exports.mockComponent = require('./component');
exports.shallow = function (c, o) {
  o = o || {};
  Object.assign(o, { shallow : true });
  return exports.component(c, o);
};

Object.defineProperties(exports, {
  build : {
    get : function () {
      if (!requireCache.build){
        requireCache.build = require('./component/build');
      }
      return requireCache.build;
    }
  },
  directive : {
    get : function () {
      if (!requireCache.directive){
        requireCache.directive = require('./directive');
      }
      return requireCache.directive;
    }
  },
  mockDirective : {
    get : function () {
      return exports.directive;
    }
  },
  store : {
    get : function () {
      if (!requireCache.store){
        requireCache.store = require('mock-vuex');
      }
      return requireCache.store;
    }
  },
  mockStore : {
    get : function () {
      return exports.store;
    }
  },
  http : {
    get : function () {
      if (!requireCache.http){
        requireCache.http = require('mock-http-client');
      }
      return requireCache.http;
    }
  },
  mockHttp : {
    get : function () {
      return exports.http;
    }
  },
  router : {
    get : function () {
      if (!requireCache.router){
        requireCache.router = require('mock-vue-router');
      }
      return requireCache.router;
    }
  },
  mockRouter : {
    get : function () {
      return exports.router;
    }
  },
  trigger : {
    get : function () {
      if (!requireCache.trigger){
        requireCache.trigger = require('./trigger');
      }
      return requireCache.trigger;
    }
  },
  reactify : {
    get : function () {
      if (!requireCache.reactify){
        requireCache.reactify = require('./reactify');
      }
      return requireCache.reactify;
    }
  },
  cleanUp : {
    get : function () {
      if (!requireCache.cleanUp){
        requireCache.cleanUp = require('./cleanUp');
      }
      return requireCache.cleanUp;
    }
  }
});
