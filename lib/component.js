module.exports = function (component, options) {

  const Vue = require(this.vuePath).extend();
  const injector = require('vue-inject').spawn();

  const mergedOptions = Object.assign({
    props : {},
    inject : {},
    store : null,
    innerHTML : '',
    name : null
  }, options);
  Object.assign(options, mergedOptions);

  const data = options.props;
  const componentName = (typeof component === 'string') ? component : (component.name || options.name);

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

  const template = [
    '<div>',
      '<', componentName, ' ', props, '>',
        options.innerHTML,
      '</', componentName, '>',
    '</div>'
  ].join('');

  // Wrap up the props in a reactive object
  options.props = this.reactify(options.props);

  // Wrap up injected items
  options.inject = this.reactify(options.inject);

  Vue.use(injector);
  Vue.prototype.dependencies = dependencies;

  const Definition = {
    template,
    components : {},
    data : () => data
  };

  if (typeof component !== 'string'){
    Definition.components[componentName] = Vue.extend(component);
  }

  let instance = new Vue(Definition).$mount();
  let child = instance.$children[0];

  return child;
};
