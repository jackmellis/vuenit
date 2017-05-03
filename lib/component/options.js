var componentMethods = require('./component');

// Merge options with default options
exports.mergeOptions = function (options, config, Vue, injector) {
  options = options || {};
  var defaultOptions = {
    Vue : Vue,
    injector : injector,
    props : {},
    inject : {},
    on : {},
    components : {},
    filters : {},
    slots : {},
    stubComponents : false,
    stubFilters : false,
    store : null,
    http : null,
    innerHTML : '',
    name : null,
    install : null,
    defaultTemplate : '<div></div>'
  };
  var mergedOptions = Object.assign(defaultOptions, config, options);
  Object.assign(options, mergedOptions);

  options.components = exports.normaliseComponents(options.components, options);
  options.filters = exports.normaliseFilters(options.filters);

  if (options.stubComponents){
    options.stubComponents = exports.normaliseComponents({ stub : options.stubComponents }, options).stub;
  }
  if (options.stubFilters){
    options.stubFilters = exports.normaliseFilters({ stub : options.stubFilters }).stub;
  }
  processSlots(options);
  return options;
};

// Convert strings, booleans, objects, into valid component definition objects
// Components can be a string, an array of strings, an object containing strings or objects, or an array of said objects
exports.normaliseComponents = function(components, options) {
  var defaultTemplate = options.defaultTemplate;
  var result = {};
  [].concat(components || []).forEach(function (componentGroup) {
    if (typeof componentGroup === 'string'){
      componentMethods.applyComponent(result, componentGroup, {
        render : componentMethods.createRender(defaultTemplate)
      });
    }else{
      Object.keys(componentGroup).forEach(function (key) {
        var component = componentGroup[key];
        switch (typeof component){
        case 'string':
          component = {
            render : componentMethods.createRender(component)
          };
          break;
        case 'boolean':
          component = {
            render : componentMethods.createRender(defaultTemplate)
          };
          break;
        case 'object':
          if (component.template && !component.render){
            component.render = componentMethods.createRender(component.template);
          }
          break;
        default:
          return;
        }
        componentMethods.applyComponent(result, key, component);
      });
    }
  });
  return result;
};

// Convert into valid filters
// filters can be a string, an array of strings, an object containing strings or functions, or an array of said objects
exports.normaliseFilters = function (filters) {
  function defaultFilter(v) {
    return v;
  }
  var result = {};
  [].concat(filters || []).forEach(function (filterGroup) {
    if (typeof filterGroup === 'string'){
      result[filterGroup] = defaultFilter;
    }else{
      Object.keys(filterGroup).forEach(function (key) {
        var filter = filterGroup[key];
        switch (typeof filter){
        case 'boolean':
          result[key] = defaultFilter;
          break;
        case 'function':
          result[key] = filter;
          break;
        }
      });
    }
  });
  return result;
};

function processSlots(options) {
  var regex = /<(.+?)(\/{0,1})>/;
  if (typeof options.slots === 'string'){
    options.slots = {default : options.slots};
  }
  Object.keys(options.slots).forEach(function (key) {
    var content = options.slots[key];
    if (key !== 'default'){
      content = content.replace(regex, '<$1 slot="' + key + '"$2>');
    }
    options.innerHTML += content;
  });
}
