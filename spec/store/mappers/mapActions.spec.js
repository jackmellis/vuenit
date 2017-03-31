import test from 'ava';
import Sinon from 'sinon';
import vuenit from '../../../lib';
import {mapActions} from 'vuex';

test.beforeEach(function (t) {
  let sinon = Sinon.sandbox.create();
  let component = {
    name : 'test-component',
    template : '<div></div>',
    methods : Object.assign(mapActions(['a']), mapActions('moduleA', ['b']), mapActions('moduleA/moduleB', ['c']))
  };

  let spyA = sinon.spy(), spyB = sinon.spy(), spyC = sinon.spy();

  let store = vuenit.store({
    actions : {
      a : spyA
    },
    modules : {
      moduleA : {
        actions : {
          b : spyB
        },
        modules : {
          moduleB : {
            actions : {
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

  return vm.a()
    .then(() => {
      t.true(spyA.called);

      return vm.b();
    })
    .then(() => {
      t.true(spyB.called);

      return vm.c();
    })
    .then(() => {
      t.true(spyC.called);
    });
});
