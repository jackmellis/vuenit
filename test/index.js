var jsdom = require('jsdom-light').jsdom;
global.document = jsdom('<html><head></head><body><div id="app"></div></body>');
global.window = global.document.defaultView;

var vuenit = require('../lib');
vuenit.vuePath = 'vue/dist/vue';

var directive = {
  bind(el, binding){
    el.innerHTML = [binding.value, binding.arg, JSON.stringify(binding.modifiers)].join(', ');
  }
};
var vm = vuenit.directive({test : directive}, {
  props : {x : 2, y : 4},
  expression : 'x + y',
  argument : 'fred',
  modifiers : ['bob']
});
console.log(vm.$el.outerHTML);

var props = {'show-something-here' : false};
var vm = vuenit.directive('if', {
  props : props,
  expression : "showSomethingHere"
});
console.log(vm.$el.outerHTML);
vm.$parent.showSomethingHere = true;
vm.$nextTick(() => {
  console.log(vm.$el.outerHTML);
  // done();
});


var vm2 = vuenit.directive('for', {
  props : {list : [1, 2, 3, 4]},
  expression : "l in list",
  template : '<div><div v-directive>{{l}}</div></div>'
});
console.log(vm2.$el.outerHTML);
