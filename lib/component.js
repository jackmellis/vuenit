module.exports = function (component, options) {

  const MasterVue = require(this.vuePath);
  const Vue = MasterVue.extend();
  const injector = require('vue-inject').spawn();

  options = Object.assign({
    props : {},
    inject : {},
    innerHTML : '',
    name : null
  }, options);

  const data = options.props;
  const componentName = (typeof component === 'string') ? component : (component.name || options.name);

  if (!componentName){
    throw new Error('Component name is not defined, please set a name property on your component definition or provide one in the options');
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
  options.props = new Vue({
    data : { data : options.props }
  }).data;

  Vue.use(injector);
  Vue.prototype.dependencies = dependencies;

  // const Definition = { template, components : {}, data : () => data};
  const Definition = {
    template,
    components : {},
    data(){
      return data;
    }
  };

  if (typeof component !== 'string'){
    Definition.components[componentName] = Vue.extend(component);
  }

  let instance = new Vue(Definition).$mount();
  let child = instance.$children[0];

  return child;
};
