var compiler = require('vue-template-compiler');
var BaseVue = require('vue');
var BaseInjector = require('vue-inject');

var mockStore = require('./store');
var mockHttp = require('./http');
var reactify = require('./reactify');

function mergeOptions(options) {
  options = options || {};
  var mergedOptions = Object.assign({
    props : {},
    inject : {},
    store : null,
    http : null,
    innerHTML : '',
    name : null
  }, options);
  Object.assign(options, mergedOptions);
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

function mergeComponent(component) {
  if (isComponent(component)){
    if (component.template && !component.render){
      component.render = createRender(component.template);
    }
    component = Object.assign({}, component);
  }else{
    component = null;
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
    var value = options.props[key];

    if (key.substr(0, 2) === 'v-'){
      return [key, '="', value, '"'].join('');
    }else{
      return [':', key, '="', key, '"'].join('');
    }
  });

  if (props.length){
    props.unshift('');
    options.props = reactify(options.props);
  }

  return props.join(' ');
}

function createComponentWrapper(component, options, Vue) {
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
    Definition.components[name] = Vue.extend(component);
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

  options = mergeOptions(options);

  component = mergeComponent(component, options);

  injectStore(options);
  injectHttp(options);

  Vue.prototype.dependencies = parseDependencies(options, injector);

  var Wrapper = createComponentWrapper(component, options, Vue);

  var instance = options.data = new Vue(Wrapper).$mount();
  var child = instance.$children[0];

  return child;
};
