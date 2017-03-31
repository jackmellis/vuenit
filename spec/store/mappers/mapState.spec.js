import test from 'ava';
import Sinon from 'sinon';
import vuenit from '../../../lib';
import {mapState} from 'vuex';

test.beforeEach(function (t) {
  let sinon = Sinon.sandbox.create();
  let component = {
    name : 'test-component',
    template : '<div></div>',
    computed : Object.assign(mapState({
      a : state => state.loading
    }), mapState('moduleA', {
      b : state => state.loading
    }), mapState('moduleA/moduleB', {
      c : state => state.loading
    }))
  };

  let store = vuenit.store({
    loading : 1,
    moduleA : {
      loading : 2,
      moduleB : {
        loading : 3
      }
    }
  });

  let vm = vuenit.component(component, {store});

  t.context = {sinon, component, store, vm};
});

test('maps state to mock store properties', function (t) {
  let {vm} = t.context;

  t.is(vm.a, 1);
  t.is(vm.b, 2);
  t.is(vm.c, 3);
});
