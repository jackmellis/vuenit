module.exports = function (component, options) {

  const Vue = require(this.vuePath).extend();
  const injector = require('vue-inject').spawn();

  options = Object.assign({
    props : {},
    inject : {},
    directives : {},
    innerHTML : ''
  }, options);

  const data = {};
  const componentName = (typeof component === 'string') ? component : component.name;

  const props = Object.keys(options.props).map(function (key) {
    let value = options.props[key];
    if (key.substr(0, 2) === 'v-'){
      return [key, '="', value, '"'].join('');
    }else{
      let camelCased = key.replace(/-./g, c => c[1].toUpperCase());
      data[camelCased] = value;
      return [':', key, '="', camelCased, '"'].join('');
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

  Vue.use(injector);
  Vue.prototype.dependencies = dependencies;

  const Definition = { template, components : {}, data : () => data};

  if (typeof component !== 'string'){
    Definition.components[componentName] = Vue.extend(component);
  }

  let instance = new Vue(Definition).$mount();
  let child = instance.$children[0];

  return child;
};
