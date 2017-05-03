import test from 'ava-spec';
import vuenit from '../../lib';

test.beforeEach(function (t) {
  let component = {
    name : 'test',
    data(){
      return {
        foo : 'foo'
      };
    },
    filters : {
      reverse(value){
        return value.split('').reverse().join('');
      }
    },
    template : `<div>{{foo | reverse}}</div>`
  };

  t.context = {component};
});

test('uses *real* filter', function (t) {
  let {component} = t.context;
  let vm = vuenit.component(component);

  let actual = vm.$html;
  let expected = '<div>oof</div>';

  t.is(actual, expected);
});

test('uses stubbed filter', function (t) {
  let {component} = t.context;
  let vm = vuenit.component(component, {
    filters : {
      reverse(v){
        return v + 'bah';
      }
    }
  });

  let actual = vm.$html;
  let expected = '<div>foobah</div>';

  t.is(actual, expected);
});

test('uses a default filter', function (t) {
  let {component} = t.context;
  let vm = vuenit.component(component, {
    filters : 'reverse'
  });

  let actual = vm.$html;
  let expected = '<div>foo</div>';

  t.is(actual, expected);
});

test('stubs all filters', function (t) {
  let {component} = t.context;
  debugger;
  let vm = vuenit.component(component, {
    stubFilters(v){
      return v + 'bah';
    }
  });

  let actual = vm.$html;
  let expected = '<div>foobah</div>';

  t.is(actual, expected);
});

test('stubs all filters with a default value', function (t) {
  let {component} = t.context;
  let vm = vuenit.component(component, {
    stubFilters : true
  });

  let actual = vm.$html;
  let expected = '<div>foo</div>';

  t.is(actual, expected);
});

test('stubs global filters', function (t) {
  let {component} = t.context;
  let filter = component.filters.reverse;
  delete component.filters;

  // First test that it actually uses the global filter
  let vm = vuenit.component(component, {
    install(Vue){
      Vue.filter('reverse', filter);
    }
  });
  t.is(vm.$html, '<div>oof</div>');

  // Now stub it
  vm = vuenit.component(component, {
    install(Vue){
      Vue.filter('reverse', filter);
    },
    stubFilters : true
  });
  t.is(vm.$html, '<div>foo</div>');
});
