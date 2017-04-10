import test from 'ava';
import vuenit from '../../lib';
import Vue from 'vue';

test('cleans up components', function (t) {
  let componentCount = Object.keys(Vue.options.components).length;
  Vue.component('test-component', { template : '<div></div>' });
  Vue.component('global-component', { template : '<pre></pre>' });

  t.not(Vue.options.components['test-component'], undefined);
  t.not(Vue.options.components['global-component'], undefined);
  t.is(Object.keys(Vue.options.components).length, componentCount + 2);

  vuenit.cleanUp();

  t.is(Vue.options.components['test-component'], undefined);
  t.is(Object.keys(Vue.options.components).length, componentCount);
});

test('cleans up directives', function (t) {
  let directiveCount = Object.keys(Vue.options.directives).length;
  Vue.directive('my-directive', () => {});
  Vue.directive('global-directive', () => {});

  t.not(Vue.options.directives['my-directive'], undefined);
  t.not(Vue.options.directives['global-directive'], undefined);
  t.is(Object.keys(Vue.options.directives).length, directiveCount + 2);

  vuenit.cleanUp();

  t.is(Vue.options.directives['my-directive'], undefined);
  t.is(Vue.options.directives['global-directive'], undefined);
  t.is(Object.keys(Vue.options.directives).length, directiveCount);
});
