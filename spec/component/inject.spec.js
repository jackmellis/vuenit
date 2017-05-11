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
    vm.factory(() => {
      t.pass();
      resolve();
    }, 50);
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
