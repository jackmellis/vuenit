import test from 'ava';
import vuenit from '../../lib';

test('attached a router to the component', t => {
  debugger;
  const Component = {
    template : '<div>{{$route.path}}</div>'
  };
  const options = {
    router : '/people'
  };
  const mount = vuenit.build(Component, options);
  const vm = mount();

  t.truthy(vm.$route);
  t.truthy(vm.$router);

  t.is(vm.$route.path, '/people');
});
