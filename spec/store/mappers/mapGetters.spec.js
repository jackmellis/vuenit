import test from 'ava';
import Sinon from 'sinon';
import vuenit from '../../../lib';
import {mapGetters} from 'vuex';

test.beforeEach(function (t) {
  let sinon = Sinon.sandbox.create();
  let component = {
    name : 'test-component',
    template : '<div></div>',
    computed : Object.assign(mapGetters(['a']), mapGetters('moduleA', ['b']), mapGetters('moduleA/moduleB', ['c']))
  };

  let store = vuenit.store({
    state : {
      loading : 1
    },
    getters : {
      a : state => state.loading
    },
    modules : {
      moduleA : {
        state : {
          loading : 2
        },
        getters : {
          b : state => state.loading
        },
        modules : {
          moduleB : {
            state : {
              loading : 3
            },
            getters : {
              c : state => state.loading
            }
          }
        }
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
