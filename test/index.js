var jsdom = require('jsdom-light').jsdom;
global.document = jsdom('<html><head></head><body><div id="app"></div></body>');
global.window = global.document.defaultView;

var vuenit = require('../lib');
vuenit.vuePath = 'vue/dist/vue';

var reactive = {
  thingy : 'I am thingy'
};

var props = {
  something : 'I am a prop'
};

var component = {
  template : '<div> <slot name="header"></slot> <div>{{something}}</div> <div>{{computed}}</div> <slot></slot> <slot name="footer"></slot> </div>',
  props : ['something'],
  computed : {
    computed(){
      return this.reactive.thingy;
    },
    fromStore(){
      return this.$store.getters['staff/employee'].id;
    }
  }
};
var options = {
  name : 'test-component',
  innerHTML : '<div slot="header">I am a header</div><div slot="footer">I am a footer</div><div>I am content</div>',
  props,
  inject : {
    reactive
  },
  store : {
    state : {
      default : {
        loading : false
      },
      staff : {
        employees : [{id : 1}, {id : 2}],
        index : 0
      }
    },
    getters : {
      default : {
        isLoading({state, rootState}){
          return state.loading;
        }
      },
      staff : {
        employee({state}){
          return state.employees[state.index];
        }
      }
    }
  }
};

var store = vuenit.store({
  state : {
    default : {
      loading : false
    },
    staff : {
      employees : [{id : 1}, {id : 2}],
      index : 0
    }
  },
  getters : {
    default : {
      isLoading({state, rootState}){
        return state.loading;
      }
    },
    staff : {
      employee({state}){
        return state.employees[state.index];
      }
    }
  }
});
store.when('staff/populate', function () {
  return 'Heres some stuff';
});
store.whenDefault = function (type, name) {
  console.log('Unknown ' + type + ' ' + name);
};
store.dispatch('staff/populate').then(function (data) {
  console.log(data);
});
store.dispatch('staff/boo');
store.commit('DO_SOMETHING');

var vm = vuenit.component(component, options);

// console.log(vm.$el.outerHTML);

console.log(vm.something);
props.something = 'I am changed';
console.log(vm.something);
vm.$nextTick(function () {
  console.log(vm.something);
  // console.log(vm.$el.outerHTML);
});

console.log(vm.computed);
reactive.thingy = 'I am a new thingy';
console.log(vm.computed);
vm.$nextTick(function () {
  console.log(vm.computed);
});

console.log(options.store === vm.$store);
console.log(vm.fromStore);
options.store.state.staff.index = 1;
// vm.$store.state.staff.index = 1;
console.log(vm.fromStore);
vm.$nextTick(function () {
  console.log(vm.fromStore);
});

var directives = {
  show : '',
  if : '',
  foo : function (el, binding) {
    if (binding.value){
      el.innerHTML += 'foo';
    }
  },
  bah : function (el, binding) {
    if (binding.modifiers.mod){
      el.innerHTML += 'bah';
    }
  }
};
var directiveOptions = {
  expression : 'x===y',
  props : {
    x : 1,
    y : 1,
    z : 2
  },
  foo : {
    expression : 'x===z'
  },
  bah : {
    argument : 'arg',
    modifiers : 'mod',
    expression : ''
  }
};
var vm2 = vuenit.directive(directives, directiveOptions);
console.log(vm2.$el.outerHTML);
