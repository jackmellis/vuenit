import test from 'ava-spec';
import sinon from 'sinon';
import vuenit from '../../lib';
import injector from 'vue-inject';

test.beforeEach(t => {
  let c = {
    name : 'my-component',
    template : '<div><span class="value">{{value}}</span><span class="name">{{name}}</span></div>',
    props : ['value', 'name', 'uuid']
  };

  t.context = {c};
});

test('has a build method', t => {
  t.truthy(vuenit.build);
  t.true(typeof vuenit.build === 'function');
});

test('returns a mount function', t => {
  let {c} = t.context;
  let mount = vuenit.build(c);
  t.true(typeof mount === 'function');
  let vm = mount();

  t.truthy(vm);
  t.is(vm.$name, 'my-component');
  t.true(vm.$contains('.value'));
  t.true(vm.$contains('.name'));
});

test('builds with the provided options', t => {
  let {c} = t.context;
  let mount = vuenit.build(c, {
    props : {
      value : 'jimmy',
      name : 'jammy'
    },
    inject : {
      $router : {}
    }
  });
  let vm = mount();

  t.is(vm.value, 'jimmy');
  t.is(vm.name, 'jammy');
  t.is(vm.$find('.value').innerHTML, 'jimmy');
  t.is(vm.$find('.name').innerHTML, 'jammy');
  t.truthy(vm.$router);
});

test('overrides options when mounting', t => {
  let {c} = t.context;
  let mount = vuenit.build(c, {
    props : {
      value : 'jimmy',
      name : 'jammy'
    },
    inject : {
      $router : {}
    }
  });
  let vm = mount({
    props : {
      value : 'benny'
    }
  });

  t.is(vm.value, 'benny');
  t.is(vm.name, 'jammy');
});

test('can be built multiple times', t => {
  let {c} = t.context;
  let build = vuenit.build(c, {
    props : {
      value : 'jimmy',
      name : 'jammy'
    }
  });
  let mount = build.build({
    props : {
      value : 'benny'
    }
  });
  let vm = mount({
    props : {
      uuid : 'xxx'
    }
  });

  t.is(vm.value, 'benny');
  t.is(vm.name, 'jammy');
  t.is(vm.uuid, 'xxx');
});

test('has options accessors', t => {
  let {c} = t.context;
  let spy = sinon.spy();
  let mount = vuenit.build(c);
  let mount2 = mount.build();
  mount.props.value = 'jimmy';
  let mount3 = mount.build({
    install : spy
  });
  mount3.before = spy;

  t.is(mount().value, 'jimmy');
  t.is(mount2().value, undefined);
  t.is(mount3().value, 'jimmy');
  t.true(spy.calledTwice);
});
