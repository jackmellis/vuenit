import test from 'ava';
import Sinon from 'sinon';
import vuenit from '../../lib';
import injector from 'vue-inject';

function describe(n, f) {f && f();}

test.beforeEach(function (t) {
  var sinon = Sinon.sandbox.create();
  var component = {
    props : ['propA', 'propB'],
    data(){
      return {
        dataA : 'dataA'
      };
    },
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
    </div>`
  };
  var options = {
    name : 'test',
    props : {
      propA : 'A',
      propB : 'B'
    }
  };

  t.context = {sinon, component, options};
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
  let vue = require('vue');
  component.name = 'my-component';
  vue.component(component.name, component);
  let vm = vuenit.component('my-component');
  t.not(vm, undefined);
});

test('converts template into render', function (t) {
  let {component, options} = t.context;

  t.is(component.render, undefined);

  vuenit.component(component, options);

  t.not(component.render, undefined);
  t.is(typeof component.render, 'function');
});

describe('props', function () {
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

describe('inject', function (t) {
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

describe('http', function () {
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

describe('store', function () {
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

describe('innerHTML', function () {
  test('passes in innerHTML for slots', function (t) {
    let {component, options} = t.context;
    component.template = '<div><slot></slot></div>';
    options.innerHTML = '<span>Slot</span>';
    let vm = vuenit.component(component, options);

    var content = vm.$el.outerHTML;

    t.is(content, '<div><span>Slot</span></div>');
  });
});
