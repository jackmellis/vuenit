require('browser-env')()['window', 'document'];
var {component : mockComponent, directive : mockDirective, store : mockStore, http : mockHttp, reactify} = require('../lib');
var injector = require('vue-inject');
var mocks = require('jpex-mocks');
injector.use(mocks);
var assert = require('assert');

debugger;

var component = {
  name : 'test-component',
  props : ['dep1', 'dep2'],
  template : '<div>My Component <slot></slot></div>',
  methods : {
    request(){
      return this.$http({
        url : '/api/1'
      });
    }
  }
};
var options = {
  props : {
    dep1 : 'foo',
    dep2 : 'bah'
  },
  innerHTML : '<span>I am a slot</span>',
  http : true,
  store : {
    users : {
      users : []
    }
  }
};
var vm = mockComponent(component, options);

vm.request().then(function () {
  console.log('success');
}, function(err){
  console.log(err);
});

vm.$http.flush();

// This is what the store should look like:
var store = mockStore({
  loading : false,
  users : {
    userId : 0,
    users : [{id : 0}]
  }
});

// or

var store2 = mockStore({
  state : {
    loading : false
  },
  getters : {
    isLoading(state, localGetters, rootState){
      return state.loading === true;
    }
  },
  mutations : {
    LOADING(state, payload){
      state.loading = !!payload;
    }
  },
  modules : {
    users : {
      state : {
        userId : 0,
        users : [{id : 0}]
      },
      getters : {
        user(state, localGetters, rootState){
          return state.users.find(u => u.id === state.userId);
        }
      },
      mutations : {
        SET_NAME(state, payload){
          state.users[0].name = payload;
        }
      },
      actions : {
        setName({state, commit}, payload){
          commit('SET_NAME', payload);
        }
      }
    }
  }
});

var store3 = mockStore({
  unconfigured : {
    foo : 'bah'
  },
  configured : {
    state : {
      test : true
    },
    getters : {
      opposite(state){
        return !state.test;
      }
    }
  }
});

var reactive = reactify({
  foo : 'foo',
  bah : 0
});

reactive.foo = 'bah';
reactive.bah++;

var directive = function(el, bound){
  console.log('Directive called');
};

var d1 = mockDirective({test : directive});
var d2 = mockDirective('v-if', {expression : 'x', props : {x : false}});

assert.equal(store.state.loading, false);
assert.equal(store2.state.loading, false);

assert.equal(store.state.users.users.length, 1);
assert.equal(store2.state.users.users.length, 1);

assert.equal(store2.getters['isLoading'], false);
assert.equal(store2.getters['users/user'].id, 0);

assert.equal(store3.state.unconfigured.foo, 'bah');
assert.equal(store3.state.configured.test, true);
assert.equal(store3.getters['configured/opposite'], false);

store2.commit('LOADING', true);
assert.equal(store2.state.loading, true);

store2.dispatch('users/setName', 'frank')
  .then(function () {
    assert.equal(store2.getters['users/user'].name, 'frank');
  });

injector.get('$promise').flush();
