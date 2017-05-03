var compiler = require('vue-template-compiler');
var BaseVue = require('vue');
var reactify = require('../reactify');
var augmentMethods = require('./augment');

exports.applyComponent = function(obj, key, value) {
  delete obj[exports.deCamelCase(key)];
  delete obj[exports.reCamelCase(key)];
  delete obj[exports.reUpperCase(key)];
  obj[key] = value;
};

exports.createRender = function(template) {
  var compiled = compiler.compile(template, {preserveWhitespace : false});
  var fn = new Function(compiled.render);
  return fn;
};

exports.mergeComponent = function (component, options) {
  if (isComponent(component)){
    // convert template into a render fn
    if (component.template && !component.render){
      component.render = exports.createRender(component.template);
    }
    // clone the component
    component = Object.assign({}, component);

    component.name = componentName(component, options);

    // stub components?
    if (options.stubComponents){
      // replace all local components with the stub
      if (component.components){
        Object.keys(component.components).forEach(function (key) {
          component.components[key] = options.stubComponents;
        });
      }
      // replace all global components with the stub
      for (var key in options.Vue.options.components){
        options.Vue.component(key, options.stubComponents);
      }
    }
    component.components = Object.assign({}, component.components, options.components);
    // ensure components are named
    Object.keys(component.components).forEach(function (key) {
      component.components[key] = Object.assign({}, component.components[key], {name : key});
    });
  }else{
    Object.keys(options.components).forEach(function (key) {
      BaseVue.component(key, options.components[key]);
    });
  }

  return component;
};

exports.createComponentWrapper = function (component, options) {
  var name = componentName(component, options);
  var props = parseProps(options);

  var template = '<div><' + name + props + '>' + options.innerHTML + '</' + name + '></div>';
  var render = exports.createRender(template);

  var Definition = {
    render : render,
    components : {},
    data : function(){
      return options.props;
    }
  };

  if (isComponent(component)){
    Definition.components[name] = options.Vue.extend(component);
  }

  return Definition;
};

exports.instantiate = function (Wrapper, component, options) {
  var instance = new options.Vue(Wrapper);
  instance.$mount();
  var vm = instance.$children[0];

  if (!vm){
    throw new Error('Failed to mount component ' + componentName(component, options));
  }

  augmentMethods.augment(vm, options);

  Object.keys(options.on).forEach(function (key) {
    vm.$on(key, options.on[key]);
  });

  vm.propsData = instance;

  return vm;
};

exports.reUpperCase = function(key) {
  var r = exports.reCamelCase(key);
  return r.charAt(0).toUpperCase() + r.substr(1);
};
exports.deCamelCase = function(key) {
  var r = key.replace(/([a-z0-9])([A-Z])/g, function(a, b, c){
    return b + '-' + c.toLowerCase();
  });
  return r.charAt(0).toLowerCase() + r.substr(1);
};
exports.reCamelCase = function(key){
  var r = key.replace(/([a-z0-9])-([a-z])/g, function(a, b, c){
    return b + c.toUpperCase();
  });
  return r.charAt(0).toLowerCase() + r.substr(1);
};

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
