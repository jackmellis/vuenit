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

test('$trigger simulates a DOM event', t => {
  let spy = Sinon.spy();
  let component = {
    template : '<button @click="onClick">Click Me</button>',
    methods : {
      onClick : spy
    }
  };
  let vm = vuenit.component(component);

  t.false(spy.called);
  t.true(typeof vm.$trigger === 'function');

  vm.$trigger('click');

  t.true(spy.called);
});

test('does not overwrite existing properties', async function (t) {
  let {component, options} = t.context;
  let obj = {};
  options.install = function (Vue) {
    Vue.prototype.$name = obj;
    Vue.prototype.$html = obj;
    Vue.prototype.$find = obj;
    Vue.prototype.$findOne = obj;
    Vue.prototype.$contains = obj;
    Vue.prototype.$create = obj;
  };
  let vm = vuenit.component(component, options);

  t.is(vm.$name, obj);
  t.is(vm.$html, obj);
  t.is(vm.$find, obj);
  t.is(vm.$findOne, obj);
  t.is(vm.$contains, obj);
  t.is(vm.$create, obj);
});

test('found elements are augmented too', t => {
  let {component, options} = t.context;
  component.template = `<div>
    <button>
      <span>
        <i>{{computedFromProps}}</i>
      </span>
    </button>
  </div>`;
  let vm = vuenit.component(component, options);
  let elements = vm.$find('button').slice();
  t.truthy(elements.length);

  let element = elements[0];

  t.is(element.$html, '<button><span><i>A B</i></span></button>');
  t.is(element.$name, 'button');
  t.true(element.$contains('i'));
  t.is(vm.$find('button').$find('i').$name, 'i');
  t.is(vm.$find('button').$find('i').$text, 'A B');
});
