var jsdom = require('jsdom-light').jsdom;
global.document = jsdom('<html><head></head><body><div id="app"></div></body>');
global.window = global.document.defaultView;

var vuenit = require('../lib');
vuenit.vuePath = 'vue/dist/vue';

var component = {
  template : '<div> <slot name="header"></slot> <div>{{something}}</div> <slot></slot> <slot name="footer"></slot> </div>',
  props : ['something']
};
var options = {
  name : 'test-component',
  innerHTML : '<div slot="header">I am a header</div><div slot="footer">I am a footer</div><div>I am content</div>',
  props : {
    something : 'I am a prop'
  }
};

var vm = vuenit.component(component, options);

console.log(vm.$el.outerHTML);

vm.data.something = 'I am changed';
console.log(vm.something);
vm.$nextTick(function () {
  console.log(vm.something);
  console.log(vm.$el.outerHTML);
});
