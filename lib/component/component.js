var compiler = require('vue-template-compiler');
var BaseVue = require('../vue');
var helpers = require('../helpers');

var hasOwn = helpers.hasOwn;
var assign = helpers.assign;

// Sets a component on obj, removes any variations on the same name
exports.applyComponent = function(obj, key, value) {
  delete obj[exports.deCamelCase(key)];
  delete obj[exports.reCamelCase(key)];
  delete obj[exports.reUpperCase(key)];
  obj[key] = value;
};

// Takes a template and returns a render function
exports.createRender = function(component) {
  var compiled = compiler.compile(component.template, {preserveWhitespace : false});
  component.render = new Function(compiled.render);
  component.staticRenderFns = (compiled.staticRenderFns || []).map(function (render) {
    return new Function(render);
  });
  return component;
};

// Merge a component with options object
exports.mergeComponent = function (component, options) {
  if (isComponent(component)) {
    // convert template into a render fn
    if (component.template && !component.render){
      exports.createRender(component);
    }
    // clone the component
    component = assign({}, component);
    component.components = assign({}, component.components);
    component.filters = assign({}, component.filters);
    component.mixins = [].concat(component.mixins || []);
    component.directives = assign({}, component.directives);
    component.computed = assign({}, component.computed);
    component.methods = assign({}, component.methods);
    component.watch = assign({}, component.watch);

    // set the component name if it hasn't already been set
    component.name = componentName(component, options);

    mergeComponents(component, options);
    mergeFilters(component, options);
    mergeDirectives(component, options);
    mergeProps(component, options);
    mergeMixins(component, options);
    mergeData(component, options);
  } else if (isExtended(component)) {
    return component.extend(exports.mergeComponent(component.options, options));
  } else {
    // Register all stubbed components globally
    Object.keys(options.components).forEach(function (key) {
      BaseVue.component(key, assign({}, options.components[key]));
    });
    // Register all stubbed filters globally
    Object.keys(options.filters).forEach(function (key) {
      BaseVue.filter(key, options.filters[key]);
    });
  }

  return component;
};

function mergeComponents(component, options) {
  if (options.stubComponents){
    // replace all local components with the stub
    Object.keys(component.components).forEach(function (key) {
      exports.applyComponent(component.components, key, options.stubComponents);
    });
    // replace all global components with the stub
    for (var key in options.Vue.options.components){
      options.Vue.component(key, assign({}, options.stubComponents));
    }
  }

  // merge stubbed components with actual components
  Object.keys(options.components).forEach(function (key) {
    exports.applyComponent(component.components, key, options.components[key]);
  });

  // ensure child components are named
  Object.keys(component.components).forEach(function (key) {
    component.components[key] = assign({name : key}, component.components[key]);
  });
}
function mergeDirectives(component, options) {
  if (options.stubDirectives){
    // replace all local directives with the stub
    Object.keys(component.directives).forEach(function (key) {
      component.directives[key] = options.stubDirectives;
    });
    // stub all global directives
    for (var key in options.Vue.options.directives){
      options.Vue.directive(key, options.stubDirectives);
    }
  }
  component.directives = assign({}, component.directives, options.directives);
}
function mergeFilters(component, options) {
  if (options.stubFilters){
    // stub all local filters
    Object.keys(component.filters).forEach(function (key) {
      component.filters[key] = options.stubFilters;
    });
    // stub all global filters
    for (var key in options.Vue.options.filters){
      options.Vue.filter(key, options.stubFilters);
    }
  }

  // merge stubbed filters with actual filters
  component.filters = assign({}, component.filters, options.filters);
}

function mergeProps(component, options) {
  function mergeProp(propName) {
    if (!hasOwn(options.props, propName)){
      options.props[propName] = undefined;
    }
  }

  if (component.props){
    [].concat(component.props || []).forEach(function (propGroup) {
      if (typeof propGroup === 'string'){
        mergeProp(propGroup);
      }else{
        Object.keys(propGroup).forEach(mergeProp);
      }
    });
  }
}

function mergeMixins(component, options) {
  var $router;
  if (options.inject.$router && options.inject.$router.$$isMockRouter){
    $router = options.inject.$router;
  }else if (options.inject.$route && options.inject.$route.$$isMockRoute){
    $router = options.inject.$route.$router;
  }
  if ($router){
    component.mixins.push({
      beforeCreate : function () {
        BaseVue.util.defineReactive(this, '$route', $router.currentRoute);
        $router.$vm = this;
      }
    });
    delete options.inject.$route;
  }
}

function mergeData(component, options) {
  if (options.data){
    var dataFn = component.data;
    component.data = function () {
      var data = {};
      if (typeof dataFn === 'function'){
        assign(data, dataFn.call(this));
      }
      if (typeof options.data === 'function'){
        assign(data, options.data.call(this, data));
      }else{
        assign(data, options.data);
      }
      return data;
    };
  }
}

// Creates a wrapper component that contains the vm component
exports.createComponentWrapper = function (component, options) {
  var name = componentName(component, options);
  var props = parseProps(options);
  var listeners = parseListeners(options);

  var template = '<div><' + name + props + listeners + '>' + options.innerHTML + '</' + name + '></div>';

  var propsData = assign({}, options.props);

  var methods = {};
  Object.keys(options.on).forEach(function (key, i) {
    methods['vhandler' + i] = options.on[key];
  });

  var Definition = {
    components : {},
    data : function(){
      return propsData;
    },
    template : template,
    methods: methods,
  };
  exports.createRender(Definition);

  if (isComponent(component) || isExtended(component)){
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

  // Register event listeners
  // Object.keys(options.on).forEach(function (key) {
  //   vm.$on(key, options.on[key]);
  // });

  // Expose the wrapper's data properties via propsData
  vm.propsData = instance;

  return vm;
};

// returns MyComponentName
exports.reUpperCase = function(key) {
  var r = exports.reCamelCase(key);
  return r.charAt(0).toUpperCase() + r.substr(1);
};
// returns my-component-name
exports.deCamelCase = function(key) {
  var r = key.replace(/([a-z0-9])([A-Z])/g, function(a, b, c){
    return b + '-' + c.toLowerCase();
  });
  return r.charAt(0).toLowerCase() + r.substr(1);
};
// returns myComponentName
exports.reCamelCase = function(key){
  var r = key.replace(/([a-z0-9])-([a-z])/g, function(a, b, c){
    return b + c.toUpperCase();
  });
  return r.charAt(0).toLowerCase() + r.substr(1);
};

function isComponent(component) {
  return (component && typeof component === 'object');
}

function isExtended(component) {
  return (component && typeof component === 'function');
}

function createComponentName() {
  return 'test-component-' + Math.floor(Math.random() * 1024);
}

function componentName(component, options) {
  var name;
  if (isComponent(component)) {
    name = component.name || options.name || createComponentName();
  } else if (isExtended(component)) {
    name = component.extendOptions.name || options.name || createComponentName();
  } else {
    name = component;
  }

  if (!name){
    throw new Error('Component name is not defined, please set a name property on your component definition or provide one in the options');
  }

  return name;
}

// make sure all props are reactive and then return an attribute string i.e. :prop-name="variableName"
function parseProps(options) {
  var props = Object.keys(options.props).map(function (key) {
    return [':', key, '="', key, '"'].join('');
  });

  if (props.length){
    props.unshift('');
  }

  return props.join(' ');
}

function parseListeners(options) {
  var listeners = Object.keys(options.on).map(function (key, i) {
    return ['@', key, '="vhandler', i, '"'].join('');
  });

  if (listeners.length){
    listeners.unshift('');
  }

  return listeners.join(' ');
}
