var compiler = require('vue-template-compiler');
var BaseVue = require('vue');
var BaseInjector = require('vue-inject');

var mockStore = require('./store');
var mockHttp = require('./http');
var reactify = require('./reactify');

function mergeOptions(options, Vue, injector) {
  options = options || {};
  var mergedOptions = Object.assign({
    Vue : Vue,
    injector : injector,
    props : {},
    inject : {},
    components : {},
    stubComponents : false,
    store : null,
    http : null,
    innerHTML : '',
    name : null,
    install : null
  }, options);
  Object.assign(options, mergedOptions);
  options.components = normaliseComponents(options.components);
  if (options.stubComponents){
    options.stubComponents = normaliseComponents({ stub : options.stubComponents }).stub;
  }
  return options;
}

function isComponent(component) {
  return (typeof component !== 'string');
}

function componentName(component, options) {
  var name = isComponent(component) ? (component.name || options.name) : component;

  if (!name){
    throw new Error('Component name is not defined, please set a name property on your component definition or provide one in the options');
  }

  return name;
}

function deCamelCase(key) {
  return key.replace(/([a-z0-9])([A-Z])/g, function(a, b, c){
    return b + '-' + c.toLowerCase();
  });
}
function reCamelCase(key){
  return key.replace(/([a-z0-9])-([a-z])/g, function(a, b, c){
    return b + c.toUpperCase();
  });
}
function applyComponent(obj, key, value) {
  obj[deCamelCase(key)] = value;
  obj[reCamelCase(key)] = value;
}

// takes a list or object or string of components and turns them into component definitions
function normaliseComponents(components) {
  var defaultTemplate = '<div></div>';
  var result = {};
  [].concat(components || []).forEach(function (componentGroup) {
    if (typeof componentGroup === 'string'){
      applyComponent(result, componentGroup, {
        render : createRender(defaultTemplate)
      });
    }else{
      Object.keys(componentGroup).forEach(function (key) {
        var component = componentGroup[key];
        switch (typeof component){
        case 'string':
          component = {
            render : createRender(component)
          };
          break;
        case 'boolean':
          component = {
            render : createRender(defaultTemplate)
          };
          break;
        case 'object':
          if (component.template && !component.render){
            component.render = createRender(component.template);
          }
          break;
        default:
          return;
        }
        applyComponent(result, key, component);
      });
    }
  });
  return result;
}

// merge a component definition with some default options
function mergeComponent(component, options) {
  if (isComponent(component)){
    // convert template into a render fn
    if (component.template && !component.render){
      component.render = createRender(component.template);
    }
    // clone the component
    component = Object.assign({}, component);

    // stub components?
    if (options.stubComponents){
      // replace all local components with the stub
      if (component.components){
        Object.keys(component.components).forEach(function (key) {
          component.components[key] = options.stubComponents;
        });
      }
      // replace all global components with the stub
      Object.keys(options.Vue.options.components).forEach(function (key) {
        options.Vue.component(key, options.stubComponents);
      });
    }
    component.components = Object.assign({}, component.components, options.components);
  }else{
    Object.keys(options.components).forEach(function (key) {
      options.Vue.component(key, options.components[key]);
    });
  }

  return component;
}

function injectStore(options) {
  if (options.store){
    options.store = mockStore(options.store);
    options.inject.$store = options.store;
  }
}

function injectHttp(options) {
  if (options.http){
    var $http = (options.http === true) ? mockHttp() : options.http;
    options.inject.$http = function(){
      return $http;
    };
  }
}

function parseDependencies(options, injector) {
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
}

function parseProps(options) {
  var props = Object.keys(options.props).map(function (key) {
    return [':', key, '="', key, '"'].join('');
  });

  if (props.length){
    props.unshift('');
    options.props = reactify(options.props);
  }

  return props.join(' ');
}

function createComponentWrapper(component, options) {
  var name = componentName(component, options);
  var props = parseProps(options);

  var template = '<div><' + name + props + '>' + options.innerHTML + '</' + name + '></div>';
  var render = createRender(template);

  var Definition = {
    render : render,
    components : {},
    data : function(){ return options.props; }
  };

  if (isComponent(component)){
    Definition.components[name] = options.Vue.extend(component);
  }

  return Definition;
}

function createRender(template) {
  var compiled = compiler.compile(template, {preserveWhitespace : false});
  var fn = new Function(compiled.render);
  return fn;
}

module.exports = function (component, options) {
  var Vue = BaseVue.extend();
  var injector = BaseInjector.spawn(true);
  Vue.use(injector);
  if (options && options.install && typeof options.install === 'function'){
    options.install(Vue, injector);
  }

  options = mergeOptions(options, Vue, injector);

  component = mergeComponent(component, options);

  injectStore(options);
  injectHttp(options);

  Vue.prototype.dependencies = parseDependencies(options, injector);

  var Wrapper = createComponentWrapper(component, options);
  var instance = new Vue(Wrapper).$mount();
  var child = instance.$children[0];

  child.propsData = instance;

  return child;
};
