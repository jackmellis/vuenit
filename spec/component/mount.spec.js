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

test('converts template into render', function (t) {
  let {component, options} = t.context;

  t.is(component.render, undefined);

  vuenit.component(component, options);

  t.not(component.render, undefined);
  t.is(typeof component.render, 'function');
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

test.group('specify vue / injector', test => {
  test('specifies a specific Vue object', t => {
    let {component, options, sinon} = t.context;
    const Vue = require('vue').extend();
    sinon.spy(Vue, 'use');
    options.install = function (V) {
      t.is(Vue, V);
    };
    options.Vue = Vue;
    vuenit.component(component, options);
    t.true(Vue.use.called);
  });
  test('specifies a specific injector', t => {
    let {component, options} = t.context;
    const i = injector.spawn();
    i.constant('foo', 'foo');
    component.dependencies = ['foo'];
    options.injector = i;

    const vm = vuenit.component(component, options);
    t.is(vm.foo, 'foo');
  });
  test('if both Vue and injector are specified, the two are not linked together automatically', t => {
    let {component, options, sinon} = t.context;
    const Vue = require('vue').extend();
    const i = injector.spawn();
    sinon.spy(Vue, 'use');
    options.Vue = Vue;
    options.injector = i;

    vuenit.component(component, options);

    t.false(Vue.use.called);
  });
});
