import test from 'ava-spec';
import Sinon from 'sinon';
import vuenit from '../../lib';
import injector from 'vue-inject';

test.beforeEach(function (t) {
  var sinon = Sinon.sandbox.create();

  var localComponent = {
    template : '<input type="search" name="local">'
  };
  var globalComponent = {
    template : '<code>I am global</code>'
  };

  var component = {
    props : ['propA', 'propB'],
    data(){
      return {
        dataA : 'dataA'
      };
    },
    components : { localComponent },
    computed : {
      computedFromProps(){
        return [this.propA, this.propB].join(' ');
      },
      computedFromStore(){
        return this.$store && this.$store.state.loading;
      }
    },
    template : `<div>
      <span>{{computedFromProps}}</span>
      <span>{{computedFromStore}}</span>
      <span>{{dataA}}</span>
      <local-component></local-component>
      <global-component></global-component>
    </div>`
  };
  var options = {
    name : 'test',
    props : {
      propA : 'A',
      propB : 'B'
    },
    install(Vue){
      Vue.component('global-component', globalComponent);
    }
  };

  t.context = {sinon, component, options};
});
test.afterEach(function () {
  delete vuenit.component.config;
});

test.group('components', function (test) {
  test('check that local and global components are rendered', function (t) {
    let {component, options} = t.context;

    const vm = vuenit.component(component, options);
    const html = vm.$el.outerHTML;

    t.true(html.indexOf('<input type="search" name="local">') > -1);
    t.true(html.indexOf('<code>I am global</code>') > -1);
  });
  test('stubs a local component with an element', function (t) {
    let {component, options} = t.context;
    options.components = {
      localComponent : '<span>stubbed</span>'
    };
    let vm = vuenit.component(component, options);
    let html = vm.$el.outerHTML;

    t.true(html.indexOf('<input type="search" name="local"') < 0);
    t.true(html.indexOf('<span>stubbed</span>') > -1);
  });
  test('stubs a local component with a dummy component', function (t) {
    let {component, options} = t.context;
    options.components = {
      localComponent : {
        template : '<span>stubbed</span>'
      }
    };
    let vm = vuenit.component(component, options);
    let html = vm.$el.outerHTML;

    t.true(html.indexOf('<input type="search" name="local"') < 0);
    t.true(html.indexOf('<span>stubbed</span>') > -1);
  });
  test('stubs a local component with a div', function (t) {
    let {component, options} = t.context;
    options.components = {
      localComponent : true
    };
    let vm = vuenit.component(component, options);
    let html = vm.$el.outerHTML;

    t.true(html.indexOf('<input type="search" name="local"') < 0);
    t.true(html.indexOf('<div></div>') > -1);
  });
  test('stubs a global component with an element', function (t) {
    let {component, options} = t.context;
    options.components = {
      globalComponent : '<span>stubbed</span>'
    };
    let vm = vuenit.component(component, options);
    let html = vm.$el.outerHTML;

    t.true(html.indexOf('<code>I am global</code>') < 0);
    t.true(html.indexOf('<span>stubbed</span>') > -1);
  });
  test('stubs a global component with a dummy component', function (t) {
    let {component, options} = t.context;
    options.components = {
      globalComponent : {
        template : '<span>stubbed</span>'
      }
    };
    let vm = vuenit.component(component, options);
    let html = vm.$el.outerHTML;

    t.true(html.indexOf('<code>I am global</code>') < 0);
    t.true(html.indexOf('<span>stubbed</span>') > -1);
  });
  test('stubs a list of components with a div by default', function (t) {
    let {component, options} = t.context;
    options.components = ['localComponent', 'globalComponent'];
    let vm = vuenit.component(component, options);
    let html = vm.$el.outerHTML;

    t.true(html.indexOf('<input type="search" name="local"') < 0);
    t.true(html.indexOf('<code>I am global</code>') < 0);
    t.true(html.indexOf('<div></div>') > -1);
  });
});

test.group('stubcomponents', function (test) {
  test('stubs all components', function (t) {
    let {component, options} = t.context;

    options.stubComponents = '<span>stubbed</span>';
    let vm = vuenit.component(component, options);
    let html = vm.$el.outerHTML;

    t.true(html.indexOf('<input type="search" name="local"') < 0);
    t.true(html.indexOf('<code>I am global</code>') < 0);
    t.true(html.indexOf('<span>stubbed</span>') > -1);
  });
  test('stubs all components with a div by default', function (t) {
    let {component, options} = t.context;

    options.stubComponents = true;
    let vm = vuenit.component(component, options);
    let html = vm.$el.outerHTML;

    t.true(html.indexOf('<input type="search" name="local"') < 0);
    t.true(html.indexOf('<code>I am global</code>') < 0);
    t.true(html.indexOf('<div></div>') > -1);
  });
  test('does not stub components that are manually stubbed', function (t) {
    let {component, options} = t.context;

    options.stubComponents = true;
    options.components = {};
    options.components.globalComponent = '<span>stubbed</span>';
    let vm = vuenit.component(component, options);
    let html = vm.$el.outerHTML;

    t.true(html.indexOf('<input type="search" name="local"') < 0);
    t.true(html.indexOf('<code>I am global</code>') < 0);
    t.true(html.indexOf('<div></div>') > -1);
    t.true(html.indexOf('<span>stubbed</span>') > -1);
  });
});
