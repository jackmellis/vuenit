import test from 'ava-spec';
import sinon from 'sinon';
import vuenit from '../../lib';

test.group('global navigation guards', test => {
  function setup(t) {
    let {$router} = vuenit.router([
      '/users',
      '/users/:userId'
    ]);
    t.context.$router = $router;
    return t.context;
  }
  test('calls guard before changing route', t => {
    let {$router} = setup(t);
    let spy = sinon.spy();
    $router.beforeEach(spy);
    $router.push('/users/4');

    t.true(spy.called);
  });
  test('does not trigger guard if only params/query changed', t => {
    let {$router} = setup(t);
    let spy = sinon.spy();
    $router.push('/users/1');
    $router.beforeEach(spy);

    t.false(spy.called);
    $router.push('/users/2');
    t.false(spy.called);
    $router.push('/users/3?foo=bah');
    t.false(spy.called);
    $router.push('/users');
    t.true(spy.called);
  });
  test('calls the guard with the current and previous route', t => {
    let {$router} = setup(t);
    t.plan(2);
    $router.beforeEach(function (to, from) {
      t.is(to.path, '/users/4');
      t.is(from.path, '/users');
    });
    $router.push('/users/4');
  });
  test('route is not updated until next is called', t => {
    let {$router} = setup(t);
    let next;
    $router.beforeEach(function (to, from, n) {
      next = n;
    });
    $router.push('/users/4');

    t.is($router.currentRoute.path, '/users');
    next();
    t.is($router.currentRoute.path, '/users/4');
  });
  test('aborts the route change with false', t => {
    let {$router} = setup(t);
    let next;
    $router.beforeEach(function (to, from, n) {
      next = n;
    });
    $router.push('/users/4');

    t.is($router.currentRoute.path, '/users');
    next(false);
    t.is($router.currentRoute.path, '/users');
  });
  test('redirects to a different location', t => {
    let {$router} = setup(t);
    let next;
    $router.beforeEach(function (to, from, n) {
      next = n;
    });
    $router.push('/users/4');

    t.is($router.currentRoute.path, '/users');
    next('/users/6'); // aborts the navigation and starts a new one
    t.is($router.currentRoute.path, '/users');
    next();
    t.is($router.currentRoute.path, '/users/6');
  });
  test('aborts if called with an error', t => {
    let {$router} = setup(t);
    let next;
    $router.beforeEach(function (to, from, n) {
      next = n;
    });
    $router.push('/users/4');

    t.is($router.currentRoute.path, '/users');
    next(new Error());
    t.is($router.currentRoute.path, '/users');
  });

  test('afterEach guard is called after successful route change', t => {
    let {$router} = setup(t);
    let spy = sinon.spy();
    let next;
    $router.beforeEach((t, f, n) => next = n);
    $router.afterEach(spy);

    $router.push('/users/4');
    t.false(spy.called);
    next();
    t.true(spy.called);
  });
});

test.group('route-specific guards', test => {
  function setup(t) {
    let {$router} = vuenit.router([
      {
        path : '/users'
      },
      {
        path : '/users/:userId',
        beforeEnter(to, from, next){
          t.context.to = to;
          t.context.from = from;
          t.context.next = next;
        }
      },
      {
        path : '/users/:userId/edit'
      }
    ]);
    t.context.$router = $router;
    return t.context;
  }
  test('calls beforeEnter when route is entered', t => {
    let {$router} = setup(t);
    t.is(t.context.next, undefined);
    t.is(t.context.to, undefined);
    t.is(t.context.from, undefined);

    $router.push('/users/4');
    t.not(t.context.next, undefined);
    t.not(t.context.to, undefined);
    t.not(t.context.from, undefined);
  });
  test('does not call beforeEnter if route is not entered', t => {
    let {$router} = setup(t);
    $router.push('/users/4/edit');
    t.is(t.context.next, undefined);
    t.is(t.context.to, undefined);
    t.is(t.context.from, undefined);
  });
  test('changes route on completion', t => {
    let {$router} = setup(t);
    $router.push('/users/4');
    t.is($router.currentRoute.path, '/users');
    t.context.next();
    t.is($router.currentRoute.path, '/users/4');
  });
  test('waits for global guards before calling', t => {
    let {$router} = setup(t);
    let next;
    $router.beforeEach((t, f, n) => next = n);
    $router.push('/users/4');

    t.is(t.context.next, undefined);
    t.not(next, undefined);

    next();
    t.not(t.context.next, undefined);
  });
  test('does not call route guard if previous guard aborted', t => {
    let {$router} = setup(t);
    let next;
    $router.beforeEach((t, f, n) => next = n);
    $router.push('/users/4');

    t.is(t.context.next, undefined);
    t.not(next, undefined);

    next(false);
    t.is(t.context.next, undefined);
  });
});

test.group('component-specific guards', test => {
  test.group('beforeRouteEnter', test => {
    function setup(t) {
      let component = {
        name : 'test',
        template : '<div></div>',
        beforeRouteEnter(to, from, next){
          t.context.to = to;
          t.context.from = from;
          t.context.next = next;
        }
      };
      let {$router} = vuenit.router(['/users', '/users/:userId']);
      let vm = vuenit.mount(component, { inject : { $router }});

      t.context.component = component;
      t.context.$router = $router;
      t.context.vm = vm;
      return t.context;
    }
    test('called when route is entered', t => {
      let {$router} = setup(t);
      t.is(t.context.to, undefined);
      $router.push('/users/4');
      t.not(t.context.to, undefined);
    });
    test('does not have access to this', t => {
      let {$router, component} = setup(t);
      t.plan(1);
      component.beforeRouteEnter = function () {
        t.is(this, null);
      };
      let vm = vuenit.mount(component, {inject : { $router }});
      $router.push('/users/4');
    });
    test('is not called if global aborts', t => {
      let {$router} = setup(t);
      $router.beforeEach(() => {}); // never calls next
      $router.push('/users/4');
      t.is(t.context.to, undefined);
    });
    test('is not called if route guard aborts', t => {
      let {component} = setup(t);
      let spy = sinon.spy();
      let {$router} = vuenit.router([
        '/users',
        {
          path : '/users/:userId',
          beforeEnter : spy
        }
      ]);
      let vm = vuenit.mount(component, {inject:{$router}});
      $router.push('/users/4');
      t.true(spy.called);
      t.is(t.context.to, undefined);
    });
    test('is not called if only params/query change', t => {
      let {$router} = setup(t);
      $router.push('/users?foo=bah');
      t.is(t.context.to, undefined);
    });
    test('is not called if component property is a string and does not match the vm name', t => {
      let {component} = setup(t);
      let spy = sinon.spy();
      let {$router} = vuenit.router([
        '/users',
        {
          path : '/users/:userId',
          component : 'my-component'
        }
      ]);
      component.beforeRouteEnter = spy;
      let vm = vuenit.mount(component, {inject:{$router}});
      $router.push('/users/4');
      t.false(spy.called);
    });
    test('is called if the component property is a string and matches the vm name', t => {
      let {component} = setup(t);
      let spy = sinon.spy();
      let {$router} = vuenit.router([
        '/users',
        {
          path : '/users/:userId',
          component : component.name
        }
      ]);
      component.beforeRouteEnter = spy;
      let vm = vuenit.mount(component, {inject:{$router}});
      $router.push('/users/4');
      t.true(spy.called);
    });
    test('is not called if component property is an object that does not match the vm name', t => {
      let {component} = setup(t);
      let spy = sinon.spy();
      let {$router} = vuenit.router([
        '/users',
        {
          path : '/users/:userId',
          component : {name : 'my-component'}
        }
      ]);
      component.beforeRouteEnter = spy;
      let vm = vuenit.mount(component, {inject:{$router}});
      $router.push('/users/4');
      t.false(spy.called);
    });
    test('is called if component property is an object that matches the vm name', t => {
      let {component} = setup(t);
      let spy = sinon.spy();
      let {$router} = vuenit.router([
        '/users',
        {
          path : '/users/:userId',
          component
        }
      ]);
      component.beforeRouteEnter = spy;
      let vm = vuenit.mount(component, {inject:{$router}});
      $router.push('/users/4');
      t.true(spy.called);
    });
    test('updates route on next', t => {
      let {$router, vm} = setup(t);
      $router.push('/users/4');
      t.is($router.currentRoute.path, '/users');
      t.context.next();
      t.is($router.currentRoute.path, '/users/4');
    });
  });

  test.group('beforeRouteUpdate', t => {
    function setup(t) {
      let spy = sinon.stub().callsFake(function (to, from, next) {
        t.context.to = to;
        t.context.from = from;
        t.context.next = next;
      });
      let component = {
        name : 'test',
        template : '<div></div>',
        beforeRouteUpdate : spy
      };
      let {$router} = vuenit.router(['/users', '/users/:userId']);
      let vm = vuenit.mount(component, { inject : { $router }});

      t.context.spy = spy;
      t.context.component = component;
      t.context.$router = $router;
      t.context.vm = vm;
      return t.context;
    }
    test('does not call if path changes', t => {
      let {spy, $router} = setup(t);
      $router.push('/users/4');
      t.false(spy.called);
    });
    test('calls if params change', t => {
      let {spy, $router} = setup(t);
      $router.push('/users/4');
      $router.push('/users/5');
      t.true(spy.called);
    });
    test('calls if query changes', t => {
      let {spy, $router} = setup(t);
      $router.push('/users?foo=bah');
      t.true(spy.called);
    });
    test('updates route on next', t => {
      let {$router}=  setup(t);
      $router.push('/users/4');
      $router.push('/users/5');

      t.is($router.currentRoute.path, '/users/4');
      t.context.next();
      t.is($router.currentRoute.path, '/users/5');
    });
  });

  test.group('beforeRouteLeave', test => {
    function setup(t) {
      let component = {
        name : 'test',
        template : '<div></div>',
        beforeRouteLeave(to, from, next){
          t.context.to = to;
          t.context.from = from;
          t.context.next = next;
        }
      };
      let {$router} = vuenit.router(['/users', '/users/:userId']);
      let vm = vuenit.mount(component, { inject : { $router }});

      t.context.component = component;
      t.context.$router = $router;
      t.context.vm = vm;
      return t.context;
    }
    test('called when route is left', t => {
      let {$router} = setup(t);
      t.is(t.context.to, undefined);
      $router.push('/users/4');
      t.not(t.context.to, undefined);
    });
    test('has access to this', t => {
      let {$router, component} = setup(t);
      t.plan(2);
      component.beforeRouteLeave = function () {
        t.not(this, null);
        t.is(this, vm);
      };
      let vm = vuenit.mount(component, {inject : { $router }});
      $router.push('/users/4');
    });
    test('is not called if only params/query change', t => {
      let {$router} = setup(t);
      $router.push('/users?foo=bah');
      t.is(t.context.to, undefined);
    });
    test('is not called if component property is a string and does not match the vm name', t => {
      let {component} = setup(t);
      let spy = sinon.spy();
      let {$router} = vuenit.router([
        {
          path : '/users',
          component : 'my-component'
        },
        {
          path : '/users/:userId'
        }
      ]);
      component.beforeRouteLeave = spy;
      let vm = vuenit.mount(component, {inject:{$router}});
      $router.push('/users/4');
      t.false(spy.called);
    });
    test('is called if the component property is a string and matches the vm name', t => {
      let {component} = setup(t);
      let spy = sinon.spy();
      let {$router} = vuenit.router([
        {
          path : '/users',
          component : component.name
        },
        {
          path : '/users/:userId',
        }
      ]);
      component.beforeRouteLeave = spy;
      let vm = vuenit.mount(component, {inject:{$router}});
      $router.push('/users/4');
      t.true(spy.called);
    });
    test('is not called if component property is an object that does not match the vm name', t => {
      let {component} = setup(t);
      let spy = sinon.spy();
      let {$router} = vuenit.router([
        {
          path : '/users',
          component : {name : 'my-component'}
        },
        {
          path : '/users/:userId'
        }
      ]);
      component.beforeRouteLeave = spy;
      let vm = vuenit.mount(component, {inject:{$router}});
      $router.push('/users/4');
      t.false(spy.called);
    });
    test('is called if component property is an object that matches the vm name', t => {
      let {component} = setup(t);
      let spy = sinon.spy();
      let {$router} = vuenit.router([
        {
          path : '/users',
          component
        },
        {
          path : '/users/:userId'
        }
      ]);
      component.beforeRouteLeave = spy;
      let vm = vuenit.mount(component, {inject:{$router}});
      $router.push('/users/4');
      t.true(spy.called);
    });
    test('updates route on next', t => {
      let {$router, vm} = setup(t);
      $router.push('/users/4');
      t.is($router.currentRoute.path, '/users');
      t.context.next();
      t.is($router.currentRoute.path, '/users/4');
    });
  });
});
