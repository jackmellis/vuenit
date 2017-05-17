var compiler = require('vue-template-compiler');
var BaseVue = require('vue');
var augmentMethods = require('./augment');

// Sets a component on obj, removes any variations on the same name
exports.applyComponent = function(obj, key, value) {
  delete obj[exports.deCamelCase(key)];
  delete obj[exports.reCamelCase(key)];
  delete obj[exports.reUpperCase(key)];
  obj[key] = value;
};

// Takes a template and returns a render function
exports.createRender = function(template) {
  var compiled = compiler.compile(template, {preserveWhitespace : false});
  var fn = new Function(compiled.render);
  return fn;
};

// Merge a component with options object
exports.mergeComponent = function (component, options) {
  if (isComponent(component)){
    // convert template into a render fn
    if (component.template && !component.render){
      component.render = exports.createRender(component.template);
    }
    // clone the component
    component = Object.assign({}, component);
    component.components = Object.assign({}, component.components);
    component.filters = Object.assign({}, component.filters);
    component.mixins = [].concat(component.mixins || []);
    component.directives = Object.assign({}, component.directives);
    component.computed = Object.assign({}, component.computed);
    component.methods = Object.assign({}, component.methods);
    component.watch = Object.assign({}, component.watch);

    // set the component name if it hasn't already been set
    component.name = componentName(component, options);

    mergeComponents(component, options);
    mergeFilters(component, options);
    mergeDirectives(component, options);
    mergeProps(component, options);
    mergeMixins(component, options);
  }else{
    // Register all stubbed components globally
    Object.keys(options.components).forEach(function (key) {
      BaseVue.component(key, Object.assign({}, options.components[key]));
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
      options.Vue.component(key, Object.assign({}, options.stubComponents));
    }
  }

  // merge stubbed components with actual components
  Object.keys(options.components).forEach(function (key) {
    exports.applyComponent(component.components, key, options.components[key]);
  });

  // ensure child components are named
  Object.keys(component.components).forEach(function (key) {
    component.components[key] = Object.assign({name : key}, component.components[key]);
  });
}
function mergeDirectives(component, options) {
  if (options.stubDirectives){
    // replace all local directives with the stub
    Object.keys(component.directives).forEach(function (key) {
      component.directives[key] = options.stubDirectives;
    });
  }
  // stub all global directives
  for (var key in options.Vue.options.directives){
    options.Vue.directive(key, options.stubDirectives);
  }
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
  component.filters = Object.assign({}, component.filters, options.filters);
}

function mergeProps(component, options) {
  function mergeProp(propName) {
    if (!Object.hasOwnProperty.call(options.props, propName)){
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

// Creates a wrapper component that contains the vm component
exports.createComponentWrapper = function (component, options) {
  var name = componentName(component, options);
  var props = parseProps(options);

  var template = '<div><' + name + props + '>' + options.innerHTML + '</' + name + '></div>';
  var render = exports.createRender(template);

  var propsData = Object.assign({}, options.props);

  var Definition = {
    render : render,
    components : {},
    data : function(){
      return propsData;
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

  // Add helper methods i.e. $html and $find
  augmentMethods.augment(vm, component, options);

  // Register event listeners
  Object.keys(options.on).forEach(function (key) {
    vm.$on(key, options.on[key]);
  });

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
  return (typeof component !== 'string');
}

function componentName(component, options) {
  var name = isComponent(component) ? (component.name || options.name) : component;

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
    // options.props = reactify(options.props);
  }

  return props.join(' ');
}
