import test from 'ava';
import vuenit from '../../lib';
import Sinon from 'sinon';

test.beforeEach(t => {
  let sinon = Sinon.sandbox.create();
  let routeWatcher = sinon.spy()

  let component = {
    name : 'my-component',
    props : ['userId', 'someProp'],
    template : '<div></div>',
    watch : {
      $route : routeWatcher
    },
    data(){
      return {
        testData : 'foo'
      };
    }
  };

  let options = {
    router : [
      '/users',
      '/users/add',
      '/users/edit',
      {path : '/users/:userId', props : true},
      {path : '/users/:userId/:someProp', props : true},
      '/users/ignore/props/:userId',
      {path : '/users/transform/props/:userId', props(route){
        var userId = route.params.userId;
        var firstChar = userId.charAt(0).toUpperCase();
        return {userId : firstChar};
      }},
      {path : '/users/has/props/object', props : { userId : 'jimmy' }}
    ],
    props : {
      someProp : 'foo'
    }
  };
  let vm = vuenit.component(component, options);

  t.context = {sinon, routeWatcher, vm};
});

test('has a $router and $route object', t => {
  let {vm} = t.context;
  t.true(vm.$route !== undefined);
  t.true(vm.$router !== undefined);
});

test('$route has current route set', t => {
  let {vm} = t.context;
  t.is(vm.$route.path, '/users');
});

test('changing route updates vm.$route', t => {
  let {vm} = t.context;
  vm.$router.push('/users/add');
  t.is(vm.$route.path, '/users/add');
});

test('changing route triggers watchers', async t => {
  let {vm, routeWatcher} = t.context;
  vm.$router.push('/users/add');
  await vm.$nextTick();

  t.true(routeWatcher.calledOnce);
});

test('has props', t => {
  let {vm} = t.context;
  t.is(vm.userId, undefined);
  t.is(vm.someProp, 'foo');
});

test('accepts props from router', async t => {
  let {vm} = t.context;
  vm.$router.push('/users/bob');
  await vm.$nextTick();

  t.is(vm.userId, 'bob');
});

test('accepts a props object from the router', async t => {
  let {vm} = t.context;
  vm.$router.push('/users/has/props/object');
  await vm.$nextTick();

  t.is(vm.userId, 'jimmy');
});

test('ignores props from router', async t => {
  let {vm} = t.context;
  vm.$router.push('/users/ignore/props/bob');
  await vm.$nextTick();

  t.is(vm.userId, undefined);
});

test('transforms props', async t => {
  let {vm} = t.context;
  vm.$router.push('/users/transform/props/bob');
  await vm.$nextTick();

  t.is(vm.userId, 'B');
});
