import test from 'ava-spec';
import sinon from 'sinon';
import vuenit from '../../lib';

test.beforeEach(t => {
  let spy1 = sinon.spy();
  let spy2 = sinon.spy();
  let c = {
    name : 'test',
    template : `<div>{{value}}</div>`,
    data(){
      return {
        value : 'initial',
        uuid : null,
        dontUpdate : 'foo'
      };
    },
    watch : {
      uuid(newVal, oldVal){
        if (oldVal){
          spy1();
        }
        if (newVal){
          spy2();
        }
      }
    }
  };

  t.context = {spy1, spy2, c};
});

test('uses real data values', async t => {
  let {c, spy1, spy2} = t.context;
  let vm = vuenit.mount(c);

  t.is(vm.value, 'initial');
  t.is(vm.uuid, null);
  t.is(vm.dontUpdate, 'foo');

  t.false(spy1.called);
  t.false(spy2.called);

  vm.uuid = 1234;
  await vm.$nextTick();

  t.false(spy1.called);
  t.true(spy2.called);

  vm.uuid = 5678;
  await vm.$nextTick();

  t.true(spy1.called);
});
test('merges with a data object', t => {
  let {c} = t.context;
  let vm = vuenit.mount(c, {
    data : {
      value : 'overwritten',
      uuid : 1234
    }
  });

  t.is(vm.value, 'overwritten');
  t.is(vm.uuid, 1234);
  t.is(vm.dontUpdate, 'foo');
});
test('merges with a data function', t => {
  let {c} = t.context;
  let vm = vuenit.mount(c, {
    data(){
      return {
        value : 'overwritten',
        uuid : 1234
      }
    }
  });

  t.is(vm.value, 'overwritten');
  t.is(vm.uuid, 1234);
  t.is(vm.dontUpdate, 'foo');
});
test('has access to vm context', t => {
  let {c} = t.context;
  let vm2;
  let vm = vuenit.mount(c, {
    data(){
      vm2 = this;
    }
  });

  t.is(vm2, vm);
});
test('actives both spies as expected', async t => {
  let {c, spy1, spy2} = t.context;
  let vm = vuenit.mount(c, {
    data : {
      uuid : 1234
    }
  });

  t.false(spy1.called);
  t.false(spy2.called);

  vm.uuid = 5678;
  await vm.$nextTick();

  t.true(spy1.called);
  t.true(spy2.called);
});
