var componentMethods = require('./component');

exports.mergeOptions = function (options, config, Vue, injector) {
  options = options || {};
  var defaultOptions = {
    Vue : Vue,
    injector : injector,
    props : {},
    inject : {},
    on : {},
    components : {},
    slots : {},
    stubComponents : false,
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
  if (options.stubComponents){
    options.stubComponents = exports.normaliseComponents({ stub : options.stubComponents }, options).stub;
  }
  processSlots(options);
  return options;
};

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
