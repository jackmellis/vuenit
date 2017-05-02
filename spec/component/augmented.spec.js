import test from 'ava-spec';
import Sinon from 'sinon';
import vuenit from '../../lib';
import injector from 'vue-inject';

test.beforeEach(function (t) {
  var sinon = Sinon.sandbox.create();

  var localComponent = {
    template : '<input type="search" name="local">'
  };
  var globalComponent = {
    template : '<code>I am global</code>'
  };

  var component = {
    props : ['propA', 'propB'],
    data(){
      return {
        dataA : 'dataA'
      };
    },
    components : { localComponent },
    computed : {
      computedFromProps(){
        return [this.propA, this.propB].join(' ');
      },
      computedFromStore(){
        return this.$store && this.$store.state.loading;
      }
    },
    template : `<div>
      <span>{{computedFromProps}}</span>
      <span>{{computedFromStore}}</span>
      <span>{{dataA}}</span>
      <local-component></local-component>
      <global-component></global-component>
    </div>`
  };
  var options = {
    name : 'test',
    props : {
      propA : 'A',
      propB : 'B'
    },
    install(Vue){
      Vue.component('global-component', globalComponent);
    }
  };

  t.context = {sinon, component, options};
});
test.afterEach(function () {
  delete vuenit.component.config;
});

test('$name returns component name', function (t) {
  let {component, options} = t.context;
  let vm = vuenit.component(component, options);
  t.is(vm.$name, 'test');
});

test('$html returns element html', function (t) {
  let {component, options} = t.context;
  let vm = vuenit.component(component, options);
  t.is(vm.$html, vm.$el.outerHTML);
});
