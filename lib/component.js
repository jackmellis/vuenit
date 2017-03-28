const compiler = require('vue-template-compiler');
var BaseVue = require('vue');
var BaseInjector = require('vue-inject');

module.exports = function (component, options) {
  const Vue = BaseVue.extend();
  const injector = BaseInjector.spawn(true);

  // Merge options with defaults
  options = options || {};
  const mergedOptions = Object.assign({
    props : {},
    inject : {},
    store : null,
    innerHTML : '',
    name : null
  }, options);
  Object.assign(options, mergedOptions);

  // Merge component with defaults
  const isComponent = typeof component !== 'string';
  if (isComponent){
    if (component.template && !component.render){
      component.render = createRender(component.template);
    }
    component = Object.assign({}, component);
  }

  const data = options.props;
  const componentName = !isComponent ? component : (component.name || options.name);

  if (!componentName){
    throw new Error('Component name is not defined, please set a name property on your component definition or provide one in the options');
  }

  if (options.store){
    options.store = this.store(options.store);
    options.inject['$store'] = options.store;
  }

  const props = Object.keys(data).map(function (key) {
    let value = data[key];
    let dashed = key.replace(/([a-z0-9])([A-Z])/g, (a, b, c) => [b, c.toLowerCase()].join('-'));

    if (dashed.substr(0, 2) === 'v-'){
      return [dashed, '="', value, '"'].join('');
    }else{
      return [':', dashed, '="', key, '"'].join('');
    }
  }).join(' ');

  const dependencies = Object.keys(options.inject).map(function (key) {
    let value = options.inject[key];
    if (typeof value === 'function'){
      injector.factory(key, value);
    }else{
      injector.constant(key, value);
    }
    return key;
  });

  const render = createRender(`<div><${componentName} ${props}>${options.innerHTML}</${componentName}</div>`);

  // Wrap up the props in a reactive object
  //options.props = this.reactify(options.props);

  // Wrap up injected items
  options.inject = this.reactify(options.inject);

  Vue.use(injector);
  Vue.prototype.dependencies = dependencies;

  const Definition = {
    render,
    components : {},
    data : () => data
  };

  if (isComponent){
    Definition.components[componentName] = Vue.extend(component);
  }

  let instance = new Vue(Definition).$mount();
  let child = instance.$children[0];

  options.data = instance;

  return child;
};

function createRender(template) {
  var compiled = compiler.compile(template, {preserveWhitespace : false});
  var fn = new Function(compiled.render);
  return fn;
}
