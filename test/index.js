require('browser-env')()['window', 'document'];
var vuenit = require('../lib');
var injector = require('vue-inject');
var mocks = require('jpex-mocks');
injector.use(mocks);

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
  http : true
};
var vm = vuenit.component(component, options);

vm.request().then(function () {
  console.log('success');
}, function(err){
  console.log(err);
});

vm.$http.flush();
