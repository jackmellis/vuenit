exports.component = exports.mount = exports.mockComponent = require('./component');
exports.directive = exports.mockDirective = require('./directive');
exports.store = exports.mockStore = require('mock-vuex');
exports.http = exports.mockHttp = require('mock-http-client');
exports.router = exports.mockRouter = require('./router');
exports.trigger = require('./trigger');
exports.reactify = require('./reactify');
exports.cleanUp = require('./cleanUp');

exports.shallow = function (c, o) {
  o = o || {};
  Object.assign(o, { shallow : true });
  return exports.component(c, o);
};
