var compiler = require('vue-template-compiler');
var BaseVue = require('vue');
var BaseInjector = require('vue-inject');
BaseVue.config.isUnknownElement = function(){};
BaseVue.config.productionTip = false;

var mockStore = require('./store');
var mockHttp = require('./http');
var reactify = require('./reactify');

function augment(instance) {
  if (Object.hasOwnProperty.call(instance, '$name')){
    return;
  }
  Object.defineProperties(instance, {
    $name : {
      get : function () {
        return this.$options.name || '';
      }
    },
    $html : {
      get : function () {
        return this.$el && this.$el.outerHTML || '';
      }
    }
  });

  instance.$find = function (q, options, first) {
    var result = [];

    if (typeof q === 'object'){
      q = q.name;
      if (!q){
        throw new Error('Component Definition must have a name property in order to find its instance');
      }
    }
    if (typeof q !== 'string' || !q){
      throw new Error('Invalid query: ' + JSON.stringify(q));
    }
    var deCamelCased = deCamelCase(q);
    var reCamelCased = reCamelCase(q);
    var reUpperCased = reUpperCase(reCamelCased);

    if (['.', '#', '['].indexOf(q.charAt(0)) < 0){
      // search components
      var children = this.$children.slice();
      while (children && children.length){
        for (var i = 0, l = children.length; i < l; i++){
          var component = children[i];
          switch(component.$options.name){
          case q:
          case deCamelCased:
          case reCamelCased:
          case reUpperCased:
            augment(component);
            if (first){
              return component;
            }
            result.push(component);
            break;
          }
        }

        children = children.map(function (component) {
          return component.$children;
        });
        children = Array.prototype.concat.apply([], children);
      }
    }

    // search elements
    if (!result.length){
      try{
        result = Array.prototype.slice.call(this.$el.querySelectorAll(q));
      }catch(e){
        // not a valid css selector
      }
    }

    if (first){
      return result.length ? result[0] : null;
    }else{
      return result;
    }
  };

  instance.$findOne = function (q) {
    return this.$find(q, null, true);
  };

  instance.$contains = function (q) {
    return !!this.$findOne(q);
  };
}

function mergeOptions(options, Vue, injector) {
  options = options || {};
  var defaultOptions = {
    Vue : Vue,
    injector : injector,
    props : {},
    inject : {},
    components : {},
    slots : {},
    stubComponents : false,
    store : null,
    http : null,
    innerHTML : '',
    name : null,
    install : null
  };
  var mergedOptions = Object.assign(defaultOptions, module.exports.config, options);
  Object.assign(options, mergedOptions);

  options.components = normaliseComponents(options.components);
  if (options.stubComponents){
    options.stubComponents = normaliseComponents({ stub : options.stubComponents }).stub;
  }
  processSlots(options);
  return options;
}

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

function reUpperCase(key) {
  var r = reCamelCase(key);
  return r.charAt(0).toUpperCase() + r.substr(1);
}
function deCamelCase(key) {
  var r = key.replace(/([a-z0-9])([A-Z])/g, function(a, b, c){
    return b + '-' + c.toLowerCase();
  });
  return r.charAt(0).toLowerCase() + r.substr(1);
}
function reCamelCase(key){
  var r = key.replace(/([a-z0-9])-([a-z])/g, function(a, b, c){
    return b + c.toUpperCase();
  });
  return r.charAt(0).toLowerCase() + r.substr(1);
}
function applyComponent(obj, key, value) {
  delete obj[deCamelCase(key)];
  delete obj[reCamelCase(key)];
  delete obj[reUpperCase(key)];
  obj[key] = value;
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
    options.install(BaseVue, injector);
  }

  options = mergeOptions(options, Vue, injector);

  component = mergeComponent(component, options);

  injectStore(options);
  injectHttp(options);

  Vue.prototype.dependencies = parseDependencies(options, injector);

  var Wrapper = createComponentWrapper(component, options);
  var instance = new Vue(Wrapper).$mount();
  var child = instance.$children[0];

  if (!child){
    throw new Error('Failed to mount component');
  }

  augment(child, options);

  child.propsData = instance;

  return child;
};
