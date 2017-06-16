var BaseVue = require('../vue');
var optionsMethods = require('./options');
var componentMethods = require('./component');
var injectorMethods = require('./injectors');

BaseVue.config.isUnknownElement = function(){};
BaseVue.config.productionTip = false;

module.exports = function (component, options) {
  // Merge Options with defaults
  options = optionsMethods.mergeOptions(options, module.exports.config);

  // Run install option
  if (typeof options.install === 'function'){
    options.install(options.Vue, options.injector);
  }

  // Create store/http objects
  injectorMethods.injectStore(options);
  injectorMethods.injectHttp(options);
  injectorMethods.injectRouter(options);

  // Merge component with options
  component = componentMethods.mergeComponent(component, options);

  // Set dependencies to be injected into the vm
  options.Vue.prototype.dependencies = injectorMethods.parseDependencies(options);

  // Call before hook
  if (options.before && typeof options.before === 'function'){
    options.before(component, options);
  }

  // Create a wrapper component that will be pass props etc. into the vm
  var Wrapper = componentMethods.createComponentWrapper(component, options);

  // Instantiate and mount the component
  var vm = componentMethods.instantiate(Wrapper, component, options);

  return vm;
};
module.exports.config = {};
