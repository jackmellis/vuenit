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

test('creates a child component', function (t) {
  let {component, options} = t.context;
  let vm = vuenit.component(component, options);

  t.not(vm, undefined);
});
test('throws if no name defined', function (t) {
  let {component, options} = t.context;
  options.name = null;

  t.throws(() => vuenit.component(component, options));
});

test('creates a global component', function (t) {
  let {component, options} = t.context;
  let inst = options.install;
  options.install = Vue => {
    Vue.component('my-component', component);
    inst(Vue);
  };
  let vm = vuenit.component('my-component', options);
  let html = vm.$el.innerHTML;

  t.not(vm, undefined);
  t.true(html.indexOf('<input type="search"') > -1);
  t.true(html.indexOf('<code>I am global</code>') > -1);
});

test('converts template into render', function (t) {
  let {component, options} = t.context;

  t.is(component.render, undefined);

  vuenit.component(component, options);

  t.not(component.render, undefined);
  t.is(typeof component.render, 'function');
});

test.group('props', function (test) {
  test('passes in props to the component', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);

    t.is(vm.propA, 'A');
    t.is(vm.propB, 'B');
  });
  test('has propsData property', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);

    t.not(vm.propsData, undefined);
  });
  test('propsData is reactive', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);

    t.is(vm.propA, 'A');
    t.is(vm.propB, 'B');
    t.is(vm.computedFromProps, 'A B');

    vm.propsData.propA = 'x';
    vm.propsData.propB = 'y';

    // Props don't come through until the next render cycle
    t.is(vm.propA, 'A');
    t.is(vm.propB, 'B');
    t.is(vm.computedFromProps, 'A B');

    return vm.$nextTick().then(function () {
      t.is(vm.propA, 'x');
      t.is(vm.propB, 'y');

      t.is(vm.propA, 'x');
      t.is(vm.propB, 'y');
      t.is(vm.computedFromProps, 'x y');
    });
  });
});

test.group('inject', function (test) {
  test('inject stuff into the instance', function (t) {
    let {component, options} = t.context;
    options.inject = {
      injected : 'fred'
    };
    let vm = vuenit.component(component, options);

    t.is(vm.injected, 'fred');
  });
  test('injects a factory', function (t) {
    let {component, options} = t.context;
    options.inject = {
      factory($timeout){
        return $timeout;
      }
    };
    let vm = vuenit.component(component, options);

    return new Promise(function (resolve) {
      vm.factory(resolve, 50);
    });
  });
});

test.group('http', function (test) {
  test('passes in a http object', function (t) {
    let {component, options} = t.context;
    let http = {};
    options.http = http;
    let vm = vuenit.component(component, options);

    t.is(vm.$http, http);
  });
  test('creates a default http object', function (t) {
    let {component, options} = t.context;
    options.http = true;
    let vm = vuenit.component(component, options);

    t.not(vm.$http, undefined);
    t.not(vm.$http.get, undefined);
  });
});

test.group('store', function (test) {
  test('passes in a store', function (t) {
    let {component, options} = t.context;
    options.store = {
      loading : false
    };
    let vm = vuenit.component(component, options);

    t.not(vm.$store, undefined);
    t.is(vm.$store.state.loading, false);
    t.is(vm.computedFromStore, false);

    options.store.state.loading = true;
    t.is(vm.computedFromStore, true);
  });
  test('passes in a default store', function (t) {
    let {component, options} = t.context;
    options.store = true;
    let vm = vuenit.component(component, options);

    t.not(vm.$store, undefined);
  });
});

test.group('innerHTML', function (test) {
  test('passes in innerHTML for slots', function (t) {
    let {component, options} = t.context;
    component.template = '<div><slot></slot></div>';
    options.innerHTML = '<span>Slot</span>';
    let vm = vuenit.component(component, options);

    var content = vm.$el.outerHTML;

    t.is(content, '<div><span>Slot</span></div>');
  });
});

test.group('install', function (test) {
  test('is called with local Vue class', function (t) {
    let {sinon, component, options} = t.context;
    let vue;
    let spy = sinon.stub().callsFake(v => vue = v);
    options.install = spy;

    vuenit.component(component, options);

    t.true(spy.called);
    t.not(vue, undefined);
    t.not(vue.use, undefined);
  });
  test('is called with local injector', function (t) {
    let {component, options} = t.context;
    let inj;
    options.install = (Vue, i) => inj = i;

    vuenit.component(component, options);

    t.not(inj, undefined);
    t.not(inj.service, undefined);
    t.not(inj, injector);
    t.true(new inj() instanceof injector);
  });
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

test.group('component config', function (test) {
  test('component options inherit config options', function (t) {
    let {component, options} = t.context;
    vuenit.component.config = options;
    let vm = vuenit.component(component, { name : 'test-component' });

    t.is(vm.propA, 'A');
    t.is(vm.propB, 'B');
  });
  test('specified options still take presidence', function (t) {
    let {component, options} = t.context;
    vuenit.component.config = options;
    options = {
      props : {
        propA : 'Y',
        propB : 'X'
      },
      name : 'test-component'
    };
    let vm = vuenit.component(component, options);

    t.is(vm.propA, 'Y');
    t.is(vm.propB, 'X');
  });
});
