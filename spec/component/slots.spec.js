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

test.group('innerHTML', function (test) {
  test('passes in innerHTML for slots', function (t) {
    let {component, options} = t.context;
    component.template = '<div><slot></slot></div>';
    options.innerHTML = '<span>Slot</span>';
    let vm = vuenit.component(component, options);

    var content = vm.$el.outerHTML;

    t.is(content, '<div><span>Slot</span></div>');
  });
});

test.group('named slots', function (test) {
  function setup(t) {
    let {component, options} = t.context;
    component.template = `<div><slot name="header"/><slot/><slot name="footer"/></div>`;
    options.slots = {};
    return t.context;
  }
  test('creates a component with a named slot', function (t) {
    let {component, options} = setup(t);
    options.slots = {
      header : '<h1>Header</h1>'
    };
    let vm = vuenit.component(component, options);
    let expected = '<div><h1>Header</h1></div>';
    let actual = vm.$html;

    t.is(actual, expected);
  });
  test('creates a component with multiple named slots', function (t) {
    let {component, options} = setup(t);
    options.slots = {
      footer : '<div>Footer</div>',
      header : '<h1>Header</h1>'
    };
    let vm = vuenit.component(component, options);
    let expected = '<div><h1>Header</h1><div>Footer</div></div>';
    let actual = vm.$html;

    t.is(actual, expected);
  });
  test('creates a component with named slots and a default slot', function (t) {
    let {component, options} = setup(t);
    options.slots = {
      footer : '<div>Footer</div>',
      header : '<h1>Header</h1>',
      default : '<section>Body</section>'
    };
    let vm = vuenit.component(component, options);
    let expected = '<div><h1>Header</h1><section>Body</section><div>Footer</div></div>';
    let actual = vm.$html;

    t.is(actual, expected);
  });
});

test.group('default slots', function (test) {
  function setup(t) {
    let {component, options} = t.context;
    component.template = `<div><slot name="header"/><slot/><slot name="footer"/></div>`;
    return t.context;
  }
  test('creates a component with a default slot', function (t) {
    let {component, options} = setup(t);
    options.slots = '<section>Body</section>';
    let vm = vuenit.component(component, options);
    let expected = '<div><section>Body</section></div>';
    let actual = vm.$html;

    t.is(actual, expected);
  });
});
