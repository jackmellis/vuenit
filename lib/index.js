var helpers = require('./helpers');
var defineGetters = helpers.defineGetters;
var assign = helpers.assign;
var requireCache = {};

exports.component = exports.mount = exports.mockComponent = require('./component');
exports.shallow = function (c, o) {
  o = o || {};
  assign(o, { shallow : true });
  return exports.component(c, o);
};

defineGetters(exports, {
  build : function () {
    if (!requireCache.build){
      requireCache.build = require('./component/build');
    }
    return requireCache.build;
  },
  directive : function () {
    if (!requireCache.directive){
      requireCache.directive = require('./directive');
    }
    return requireCache.directive;
  },
  mockDirective : function () {
    return exports.directive;
  },
  store : function () {
    if (!requireCache.store){
      requireCache.store = require('mock-vuex');
    }
    return requireCache.store;
  },
  mockStore : function () {
    return exports.store;
  },
  http : function () {
    if (!requireCache.http){
      requireCache.http = require('mock-http-client');
    }
    return requireCache.http;
  },
  mockHttp : function () {
    return exports.http;
  },
  router : function () {
    if (!requireCache.router){
      requireCache.router = require('mock-vue-router');
    }
    return requireCache.router;
  },
  mockRouter : function () {
    return exports.router;
  },
  trigger : function () {
    if (!requireCache.trigger){
      requireCache.trigger = require('./trigger');
    }
    return requireCache.trigger;
  },
  reactify : function () {
    if (!requireCache.reactify){
      requireCache.reactify = require('./reactify');
    }
    return requireCache.reactify;
  },
  cleanUp : function () {
    if (!requireCache.cleanUp){
      requireCache.cleanUp = require('./cleanUp');
    }
    return requireCache.cleanUp;
  }
});
