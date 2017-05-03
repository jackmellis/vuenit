var BaseVue = require('vue');
var BaseInjector = require('vue-inject');
var optionsMethods = require('./options');
var componentMethods = require('./component');
var injectorMethods = require('./injectors');

BaseVue.config.isUnknownElement = function(){};
BaseVue.config.productionTip = false;

module.exports = function (component, options) {
  var Vue = BaseVue.extend();
  var injector = BaseInjector.spawn(true);
  Vue.use(injector);
  if (options && options.install && typeof options.install === 'function'){
    options.install(BaseVue, injector);
  }

  options = optionsMethods.mergeOptions(options, module.exports.config, Vue, injector);

  component = componentMethods.mergeComponent(component, options);

  injectorMethods.injectStore(options);
  injectorMethods.injectHttp(options);

  Vue.prototype.dependencies = injectorMethods.parseDependencies(options);

  var Wrapper = componentMethods.createComponentWrapper(component, options);

  var vm = componentMethods.instantiate(Wrapper, component, options);

  return vm;
};
