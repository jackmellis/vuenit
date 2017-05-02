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

test('is called with local Vue class', function (t) {
  let {sinon, component, options} = t.context;
  let vue;
  let spy = sinon.stub().callsFake(v => vue = v);
  options.install = spy;

  vuenit.component(component, options);

  t.true(spy.called);
  t.not(vue, undefined);
  t.not(vue.use, undefined);
});
test('is called with local injector', function (t) {
  let {component, options} = t.context;
  let inj;
  options.install = (Vue, i) => inj = i;

  vuenit.component(component, options);

  t.not(inj, undefined);
  t.not(inj.service, undefined);
  t.not(inj, injector);
  t.true(new inj() instanceof injector);
});
