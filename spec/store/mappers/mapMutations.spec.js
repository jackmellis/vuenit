import test from 'ava';
import Sinon from 'sinon';
import vuenit from '../../../lib';
import {mapMutations} from 'vuex';

test.beforeEach(function (t) {
  let sinon = Sinon.sandbox.create();
  let component = {
    name : 'test-component',
    template : '<div></div>',
    methods : Object.assign(mapMutations(['a']), mapMutations('moduleA', ['b']), mapMutations('moduleA/moduleB', ['c']))
  };

  let spyA = sinon.spy(), spyB = sinon.spy(), spyC = sinon.spy();

  let store = vuenit.store({
    mutations : {
      a : spyA
    },
    modules : {
      moduleA : {
        mutations : {
          b : spyB
        },
        modules : {
          moduleB : {
            mutations : {
              c : spyC
            }
          }
        }
      }
    }
  });

  let vm = vuenit.component(component, {store});

  t.context = {sinon, component, store, vm, spyA, spyB, spyC};
});

test('maps state to mock store properties', function (t) {
  let {vm, spyA, spyB, spyC} = t.context;

  vm.a();
  vm.b();
  vm.c();

  t.true(spyA.called);
  t.true(spyB.called);
  t.true(spyC.called);
});
