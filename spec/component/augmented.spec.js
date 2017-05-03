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

test('$create creates a new instance', async function (t) {
  let {component, options} = t.context;
  let vm1 = vuenit.component(component, options);
  let vm2 = vm1.$create();

  t.true(vm1 !== undefined);
  t.not(vm1, vm2);
  t.not(vm1.propsData, vm2.propsData);

  t.is(vm1.dataA, vm2.dataA);
  vm1.dataA = 'foo';
  vm2.dataA = 'bah';
  vm1.propsData.propA = 'C';
  vm2.propsData.propA = 'D';
  t.not(vm1.propsData.propA, vm2.propsData.propA);

  await vm1.$nextTick();
  await vm2.$nextTick();

  t.not(vm1.dataA, vm2.dataA);

  t.is(vm1.propA, 'C');
  t.is(vm2.propA, 'D');
});
