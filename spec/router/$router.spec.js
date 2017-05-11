import test from 'ava-spec';
import vuenit from '../../lib';

test('has a list of routes', t => {
  let {$router} = vuenit.router();
  t.true(Array.isArray($router.routes));
  t.is($router.routes.length, 1);
});

test.group('addRoutes', test => {
  test('adds an extra route by string', t => {
    let {$router} = vuenit.router();
    $router.addRoutes('/users');
    t.is($router.routes.length, 2);
    t.is($router.routes[1].path, '/users');
  });

  test('adds an extra route by object', t => {
    let {$router} = vuenit.router();
    $router.addRoutes({path : '/users'});
    t.is($router.routes.length, 2);
    t.is($router.routes[1].path, '/users');
  });

  test('adds multiple routes by string', t => {
    let {$router} = vuenit.router();
    $router.addRoutes(['/users', '/users/add']);
    t.is($router.routes.length, 3);
    t.is($router.routes[1].path, '/users');
    t.is($router.routes[2].path, '/users/add');
  });

  test('adds multiple routes by object', t => {
    let {$router} = vuenit.router();
    $router.addRoutes([{path : '/users'}, {path : '/users/add'}]);
    t.is($router.routes.length, 3);
    t.is($router.routes[1].path, '/users');
    t.is($router.routes[2].path, '/users/add');
  });
});

test('has the current route', t => {
  let {$route, $router} = vuenit.router();
  t.is($router.currentRoute.path, $route.path);
});

test.group('push', test => {
  test('pushes a new route', t => {
    let {$router} = vuenit.router(['/', '/users']);
    t.is($router.currentRoute.path, '/');
    $router.push('/users');
    t.is($router.currentRoute.path, '/users');
  });

  test('updates the currentRoute', t => {
    let {$router, $route} = vuenit.router(['/', '/users']);
    $router.push('/users');
    t.not($router.currentRoute, $route);
    t.deepEqual($router.currentRoute, $route);
  });

  test('updates $route', t => {
    let {$router, $route} = vuenit.router(['/', '/users']);
    $router.push('/users');
    t.is($route.path, '/users');
  });

  test('pushes a new route object', t => {
    let {$router, $route} = vuenit.router(['/', '/user', '/user/:userId']);
    $router.push({
      path : '/user/:userId',
      params : {
        userId : '4'
      },
      query : {
        foo : 1,
        bah : 2
      },
      hash : 'myid'
    });

    t.is($route.path, '/user/4');
    t.is($route.fullPath, '/user/4#myid?foo=1&bah=2')
  });

  test('pushes a route object with a named route', t => {
    let {$router, $route} = vuenit.router([
      {
        path : '/',
        name : 'home'
      },
      {
        path : '/user/:userId',
        name : 'user'
      }
    ]);
    $router.push({
      name : 'user',
      params : {
        userId : '4'
      },
      query : {
        foo : 1,
        bah : 2
      },
      hash : 'myid'
    });

    t.is($route.path, '/user/4');
    t.is($route.fullPath, '/user/4#myid?foo=1&bah=2');
  });

  test('pushes an invalid route', t => {
    let {$router, $route} = vuenit.router();
    $router.push('/users/4');

    t.is($route.path, '/users/4');
  });
  test('pushes an invalid name', t => {
    let {$router, $route} = vuenit.router();
    $router.push({name : 'user'});

    t.is($route.path, '/user');
  });
});

test('goes to a step in the history', t => {
  let {$router} = vuenit.router(['/', '/users', '/users/add']);
  $router.push('/users');
  $router.push('/users/add');

  $router.go(-100);
  t.is($router.currentRoute.path, '/');
  $router.go(2);
  t.is($router.currentRoute.path, '/users/add');
  $router.go(-1);
  t.is($router.currentRoute.path, '/users');
});

test('goes back in history', t => {
  let {$router} = vuenit.router(['/', '/users', '/users/add']);
  $router.push('/users');
  $router.push('/users/add');

  t.is($router.currentRoute.path, '/users/add');
  $router.back();
  t.is($router.currentRoute.path, '/users');
  $router.back();
  t.is($router.currentRoute.path, '/');
});

test('goes forward in history', t => {
  let {$router} = vuenit.router(['/', '/users', '/users/add']);
  $router.push('/users');
  $router.push('/users/add');
  $router.go(-100);

  t.is($router.currentRoute.path, '/');
  $router.forward();
  t.is($router.currentRoute.path, '/users');
  $router.forward();
  t.is($router.currentRoute.path, '/users/add');
});

test('replaces current route', t => {
  let {$router} = vuenit.router(['/', '/users', '/users/add']);
  $router.push('/users');
  $router.push('/users/add');
  $router.go(-1);

  t.is($router.currentRoute.path, '/users');
  $router.replace('/users/add');
  $router.go(1);
  t.is($router.currentRoute.path, '/users/add');
  $router.back();
  t.is($router.currentRoute.path, '/users/add'); // used to be /users
  $router.back();
  t.is($router.currentRoute.path, '/');
});

test.group('$router.routes[x].active', test => {
  test('is true if route is active', t => {
    let {$router} = vuenit.router(['/', '/users']);
    t.true($router.routes[0].active);
  });
  test('is false if route is not active', t => {
    let {$router} = vuenit.router(['/', '/users']);
    t.false($router.routes[1].active);
  });
  test('changes when route changes', t => {
    let {$router} = vuenit.router(['/', '/users']);
    t.true($router.routes[0].active);
    t.false($router.routes[1].active);
    $router.push('/users');
    t.false($router.routes[0].active);
    t.true($router.routes[1].active);
  });
});

test.group('$router.routes[x].activate', test => {
  test('sets the route to active (pushes the route)', t => {
    let {$router} = vuenit.router(['/', '/users']);
    $router.routes[1].activate();
    t.is($router.currentRoute.path, '/users');
    t.true($router.routes[1].active);
  });
  test('sets the route with specific parameters', t => {
    let {$router} = vuenit.router(['/', '/users/:userId']);
    $router.routes[1].activate({params : { userId : '4'}});
    t.is($router.currentRoute.path, '/users/4');
    t.is($router.currentRoute.params.userId, '4');
  });
  test('sets the route with a query', t => {
    let {$router} = vuenit.router(['/', '/users']);
    $router.routes[1].activate({query : {foo : 'bah'}});
    t.is($router.currentRoute.path, '/users');
    t.is($router.currentRoute.query.foo, 'bah');
    t.is($router.currentRoute.fullPath, '/users?foo=bah');
  });
  test('sets the route with a hash', t => {
    let {$router} = vuenit.router(['/', '/users']);
    $router.routes[1].activate({hash : 'myid'});
    t.is($router.currentRoute.path, '/users');
    t.is($router.currentRoute.hash, '#myid');
    t.is($router.currentRoute.fullPath, '/users#myid');
  });
});
