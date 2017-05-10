import test from 'ava';
import vuenit from '../../lib';

test('creates empty router', t => {
  let result = vuenit.router();
  t.true(result !== undefined);
  t.true(result.$router !== undefined);
  t.true(result.$route !== undefined);
});
test('creates a default route', t => {
  let result = vuenit.router();
  t.is(result.$router.routes.length, 1);
  t.is(result.$router.routes[0].path, '/');
});

test('creates a router from object config', t => {
  let result = vuenit.router({
    routes : [
      {
        path : '/'
      },
      {
        path : '/users',
        children : [
          {
            path : ':userId'
          }
        ]
      }
    ]
  });
  t.is(result.$router.routes.length, 2);
  t.is(result.$router.routes[0].path, '/');
  t.is(result.$router.routes[1].path, '/users');
  t.is(result.$router.routes[1].children.length, 1);
  t.is(result.$router.routes[1].children[0].path, ':userId');
});
test('sets initial route', t => {
  let result = vuenit.router({
    routes : [
      {
        path : '/'
      },
      {
        path : '/users',
        children : [
          {
            path : ':userId'
          }
        ]
      }
    ],
    route : '/users'
  });

  t.is(result.$route.path, '/users');
});
test('defaults to first route', t => {
  let result = vuenit.router({
    routes : [
      {
        path : '/'
      },
      {
        path : '/users',
        children : [
          {
            path : ':userId'
          }
        ]
      }
    ]
  });

  t.is(result.$route.path, '/');
});
test('creates a default route if no routes', t => {
  let result = vuenit.router({
    routes : [],
  });

  t.is(result.$router.routes.length, 1);
  t.is(result.$route.path, '/');
});
test('creates a default route if routes property is missing', t => {
  let result = vuenit.router({});

  t.is(result.$router.routes.length, 1);
});

test('creates a router from array of routes', t => {
  let result = vuenit.router([
    {
      path : '/'
    },
    {
      path : '/users',
      children : [
        {
          path : ':userId'
        }
      ]
    }
  ]);
  t.is(result.$router.routes.length, 2);
  t.is(result.$route.path, '/');
});

test('creates a router from array of strings', t => {
  let result = vuenit.router(['/', '/users']);
  t.is(result.$router.routes.length, 2);
  t.is(result.$router.routes[1].path, '/users');
  t.is(result.$route.path, '/');
});

test('creates router children from array of strings', t => {
  let result = vuenit.router([
    {
      path : '/users',
      children : ['add']
    }
  ]);
  t.is(result.$router.routes.length, 1);
  t.is(result.$router.routes[0].children.length, 1);
  t.is(result.$router.routes[0].children[0].path, 'add');
});

test('creates a router from single string', t => {
  let result = vuenit.router('/users');
  t.is(result.$router.routes.length, 1);
  t.is(result.$router.routes[0].path, '/users');
  t.is(result.$route.path, '/users');
});

test('creates router children from a single string', t => {
  let result = vuenit.router([
    {
      path : '/users',
      children : 'add'
    }
  ]);
  t.is(result.$router.routes.length, 1);
  t.is(result.$router.routes[0].children.length, 1);
  t.is(result.$router.routes[0].children[0].path, 'add');
});

test('creates a router from an array of strings but sets the route from parameter 2', t => {
  let result = vuenit.router(['/users/add', '/users/edit'], '/users/edit');
  t.is(result.$router.routes[0].path, '/users/add');
  t.is(result.$router.routes[1].path, '/users/edit');
  t.is(result.$route.path, '/users/edit');
  t.is(result.$route.matched[0], result.$router.routes[1]);
});
