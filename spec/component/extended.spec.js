import test from 'ava-spec';
import vuenit from '../../lib';
import Vue from 'vue';

test('can mount an extended component', t => {
  const C = Vue.extend({
    name: 'my-component',
    props: ['propA', 'propB'],
    template: '<div>{{propA}} {{propB}}</div>'
  });

  const vm = vuenit.mount(C, {
    props: {
      propA: 'a',
      propB: 'b',
    }
  });

  t.true(!!vm);
  t.is(vm.$name, 'my-component');
  t.is(vm.$html, '<div>a b</div>');
});

test('can mount an extended extended component', t => {
  const C = Vue.extend({
    name: 'my-component',
    props: ['propA', 'propB'],
    template: '<div>{{propA}} {{propB}}</div>'
  });
  const C2 = C.extend();
  const C3 = C2.extend({
    props: ['propA', 'propC'],
  });

  const vm = vuenit.mount(C3, {
    props: {
      propA: 'a',
      propB: 'b',
    }
  });

  t.true(!!vm);
  t.is(vm.$name, 'my-component');
  t.is(vm.$html, '<div>a b</div>');
});
