import test from 'ava-spec';
import Sinon from 'sinon';
import injector from 'vue-inject';
import {store as mock} from '../../lib';

test.beforeEach(function (t) {
  let sinon = Sinon.sandbox.create();
  let $promise = injector.get('$promise');

  t.context = {sinon};
});
test.afterEach(function (t) {
  t.context.sinon.restore();
});

test.group('state-only', function (test) {
  test('it creates a store with root state', function (t) {
    let store = mock({
      loading : true,
      foo : 'bah'
    });

    t.not(store.state, undefined);
    t.is(store.state.loading, true);
    t.is(store.state.foo, 'bah');
  });
  test('it creates nested modules', function (t) {
    let store = mock({
      moduleA : {
        value : 'A'
      },
      moduleB : {
        value : 'B',
        moduleC : {
          value : 'C'
        }
      }
    });

    t.is(store.state.moduleA.value, 'A');
    t.is(store.state.moduleB.value, 'B');
    t.is(store.state.moduleB.moduleC.value, 'C');
  });

  test('it allows a mixed configuration', function (t) {
    let store = mock({
      simple : {
        loading : true,
        foo : 'bah'
      },
      complex : {
        state : {
          loading : false,
          foo : 'bah'
        },
        getters : {
          getMe : () => 'got!'
        }
      }
    });

    t.is(store.state.simple.loading, true);
    t.is(store.state.simple.foo, 'bah');
    t.is(store.state.complex.loading, false);
    t.is(store.state.complex.foo, 'bah');
    t.is(store.getters['complex/getMe'], 'got!');
  });
});

test.group('state', function (test) {
  test('it creates a store with root state', function (t) {
    let store = mock({
      state : {
        loading : true
      }
    });

    t.is(store.state.loading, true);
  });
  test('it creats a store with nested states', function (t) {
    let store = mock({
      modules : {
        foo : {
          state : {
            loading : false
          }
        }
      }
    });

    t.is(store.state.foo.loading, false);
  });
});

test.group('getters', function (test) {
  test('it creates a store with getters', function (t) {
    let store = mock({
      getters : {
        getterA : () => 'A',
        getterB : () => 'B'
      }
    });

    t.is(store.getters.getterA, 'A');
    t.is(store.getters.getterB, 'B');
  });
  test('it creates getters with nested module paths', function (t) {
    let store = mock({
      modules : {
        moduleA : {
          modules : {
            moduleB : {
              getters : {
                getterA : () => 'A',
                getterB : () => 'B'
              }
            }
          }
        }
      }
    });

    t.is(store.getters['moduleA/moduleB/getterA'], 'A');
    t.is(store.getters['moduleA/moduleB/getterB'], 'B');
  });
  test('getter has access to local state', function (t) {
    let store = mock({
      moduleA : {
        state : {
          foo : 'bah'
        },
        getters : {
          getterA(state){
            return state.foo;
          }
        }
      }
    });

    t.is(store.getters['moduleA/getterA'], 'bah');
  });
  test('getter has access to other local getters', function (t) {
    let store = mock({
      moduleA : {
        getters : {
          getterA : () => 'foo',
          getterB(state, getters){
            return getters.getterA;
          }
        }
      }
    });

    t.is(store.getters['moduleA/getterB'], 'foo');
  });
  test('getter has access to root state', function (t) {
    let store = mock({
      loading : true,
      moduleA : {
        getters : {
          isRootLoading(state, getters, rootState){
            return rootState.loading;
          }
        }
      }
    });

    t.is(store.getters['moduleA/isRootLoading'], true);
  });
});

test.group('mutations', function (test) {
  test('calls the mutation method', function (t) {
    let spy = t.context.sinon.spy();

    let store = mock({
      mutations : {
        TEST : spy
      }
    });

    store.commit('TEST');

    t.true(spy.called);
  });
  test('calls a nested mutation method', function (t) {
    let spy = t.context.sinon.spy();

    let store = mock({
      moduleA : {
        mutations : {
          TEST : spy
        }
      }
    });

    store.commit('TEST');
    t.false(spy.called);

    store.commit('moduleA/TEST');
    t.true(spy.called);
  });
  test('has access to the local state', function (t) {
    return new Promise(resolve => {
      let store = mock({
        moduleA : {
          state : {
            loading : true
          },
          mutations : {
            TEST(state){
              t.is(state.loading, true);
              resolve();
            }
          }
        }
      });

      store.commit('moduleA/TEST');
    });
  });
  test('has access to the payload', function (t) {
    return new Promise(resolve => {
      let store = mock({
        moduleA : {
          mutations : {
            TEST(state, payload){
              t.is(payload, 'foo');
              resolve();
            }
          }
        }
      });

      store.commit('moduleA/TEST', 'foo');
    });
  });
});

test.group('actions', function (test) {
  test('calls the action method', function (t) {
    let {sinon} = t.context;

    let spy = sinon.spy();
    let store = mock({
      actions : {
        test : spy
      }
    });

    return store.dispatch('test')
      .then(() => {
        t.true(spy.called);
      });
  });
  test('calls a nested action method', function (t) {
    let {sinon} = t.context;
    let spy = sinon.spy();

    let store = mock({
      moduleA : {
        moduleB : {
          actions : {
            test : spy
          }
        }
      }
    });

    return store.dispatch('moduleA/moduleB/test').then(() => {
      t.true(spy.called);
    });
  });
  test('always returns a promise', function (t) {
    let store = mock();

    return store.dispatch('some/unknown/event').then(() => {
      // should not reject
    });
  });
  test('has access to local state', function (t) {
    let store = mock({
      moduleA : {
        state : {
          loading : true
        },
        actions : {
          test({state}){
            return state.loading;
          }
        }
      }
    });

    return store.dispatch('moduleA/test').then(result => {
      t.is(result, true);
    });
  });
  test('has access to root state', function (t) {
    let store = mock({
      loading : true,
      moduleA : {
        state : {
          loading : false
        },
        actions : {
          test({state, rootState}){
            return rootState.loading;
          }
        }
      }
    });

    return store.dispatch('moduleA/test').then(result => {
      t.is(result, true);
    });
  });
  test('has access to local dispatch', function (t) {
    let store = mock({
      moduleA : {
        actions : {
          test({dispatch}){
            return dispatch('test2').then(response => response);
          },
          test2(){
            return 'success';
          }
        }
      }
    });

    return store.dispatch('moduleA/test').then(result => {
      t.is(result, 'success');
    });
  });
  test('has access to local commit', function (t) {
    let {sinon} = t.context;
    let spy = sinon.spy();

    let store = mock({
      moduleA : {
        mutations : {
          TEST : spy
        },
        actions : {
          test({commit}){
            commit('TEST');
          }
        }
      }
    });

    return store.dispatch('moduleA/test').then(() => {
      t.true(spy.called);
    });
  });
  test('has access to the payload', function (t) {
    let store = mock({
      actions : {
        test(context, payload){
          return payload;
        }
      }
    });

    return store.dispatch('test', 'fred').then(result => {
      t.is(result, 'fred');
    });
  });
});

test.group('when', function (test) {
  function setup(t) {
    let store = mock({
      moduleA : {
        count : 0
      }
    });

    t.context.store = store;

    return t.context;
  }

  test('triggers the response when the related method is used', function (t) {
    let {store, sinon} = setup(t);
    let spy = sinon.spy();
    let spy2 = sinon.spy();
    store.when('dispatch').call(spy);
    store.when('COMMIT').call(spy2);

    t.false(spy.called);
    t.false(spy2.called);

    store.commit('COMMIT');
    t.false(spy.called);
    t.true(spy2.called);

    return store.dispatch('dispatch').then(() => {
      t.true(spy.called);
    });
  });
  test('returns a value', function (t) {
    let {store} = setup(t);
    store.when('dispatch').return('foo');
    store.when('COMMIT').return('bah');

    t.is(store.commit('COMMIT'), 'bah');

    return store.dispatch('dispatch').then(result => {
      t.is(result, 'foo');
    });
  });
  test.cb('returns a hanging promise', function (t) {
    let {store} = setup(t);
    store.when('dispatch').stop();

    store.dispatch('dispatch').then(() => {
      t.fail();
      t.end();
    }, () => {
      t.fail();
      t.end();
    });

    setTimeout(() => {
      t.pass();
      t.end();
    }, 500);
  });
  test('throws an error', function (t) {
    let {store} = setup(t);
    store.when('COMMIT').throw();
    store.when('dispatch').throw();

    t.throws(() => store.commit('COMMIT'));

    return store.dispatch('dispatch').catch(() => {
      t.pass();
    });
  });
});
