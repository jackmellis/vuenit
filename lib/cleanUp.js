var Vue = require('./vue');

module.exports = function () {
  var sacredComponents = ['KeepAlive', 'Transition', 'TransitionGroup'];
  Object.keys(Vue.options.components)
    .filter(function (key) {
      return sacredComponents.indexOf(key) < 0;
    })
    .forEach(function (key) {
      delete Vue.options.components[key];
    });
  var sacredDirectives = ['model', 'show'];
  Object.keys(Vue.options.directives)
    .filter(function (key) {
      return sacredDirectives.indexOf(key) < 0;
    })
    .forEach(function (key) {
      delete Vue.options.directives[key];
    });
  Object.keys(Vue.options.filters)
    .forEach(function (key) {
      delete Vue.options.filters[key];
    });
};
