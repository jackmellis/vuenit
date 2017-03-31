import test from 'ava';
import Sinon from 'sinon';
import vuenit from '../../lib';

function describe(n, f){f && f();}

test.beforeEach(function (t) {
  let http = vuenit.http();
  let sinon = Sinon.sandbox.create();

  t.context = {http, sinon};
});
test.afterEach(function (t) {
  t.context.sinon.restore();
});

describe('methods', function(){
  test('sends a get request', function (t) {
    let {http} = t.context;
    let spy = t.context.spy = t.context.sinon.spy();
    t.context.http.when('get', 'api/1').call(spy);

    return http.get('api/1').then(() => {
      t.true(spy.called);
    });
  });
  test('sends a put request', function (t) {
    let {http} = t.context;
    let spy = t.context.spy = t.context.sinon.spy();
    t.context.http.when('put', 'api/1').call(spy);

    return http.put('api/1').then(() => {
      t.true(spy.called);
    });
  });
  test('sends a post request', function (t) {
    let {http} = t.context;
    let spy = t.context.spy = t.context.sinon.spy();
    t.context.http.when('post', 'api/1').call(spy);

    return http.post('api/1').then(() => {
      t.true(spy.called);
    });
  });
  test('sends a delete request', function (t) {
    let {http} = t.context;
    let spy = t.context.spy = t.context.sinon.spy();
    t.context.http.when('delete', 'api/1').call(spy);

    return http.delete('api/1').then(() => {
      t.true(spy.called);
    });
  });
  test('sends a patch request', function (t) {
    let {http} = t.context;
    let spy = t.context.spy = t.context.sinon.spy();
    t.context.http.when('patch', 'api/1').call(spy);

    return http.patch('api/1').then(() => {
      t.true(spy.called);
    });
  });
  test('sends an options request', function (t) {
    let {http} = t.context;
    let spy = t.context.spy = t.context.sinon.spy();
    t.context.http.when('options', 'api/1').call(spy);

    return http.options('api/1').then(() => {
      t.true(spy.called);
    });
  });
});

describe('strict mode', function(){;
  test('throws an error when no response is found in strict mode', function (t) {
    let {http} = t.context;

    return http.get('api/1').then(() => {
      t.fail('Should not resolve!');
    }, () => {
      t.pass();
    });
  });
  test('does not throw an error if not in strict mode', function (t) {
    let {http} = t.context;
    http.strict = false;

    return http.get('api/1').then(() => {
      t.pass();
    }, (e) => {
      t.fail(e);
    });
  });
  test('otherwise is called when no response matches', function (t) {
    let {http} = t.context;
    http.otherwise();

    return http.get('api/1').then(() => {
      t.pass();
    }, (e) => {
      t.fail();
    });
  });
});

describe('responses', function(){
  function setup(t){
    t.context.http.when('delete', 'api/1');
    t.context.http.when('get', 'api/1').return('returned');
    t.context.http.when('post', 'api/1').call(() => 'called');
    t.context.http.when('put', 'api/1').reject('rejected');
    t.context.http.when('patch', 'api/1').stop();
    return t.context;
  }
  test('returns a default resolved promise', function (t) {
    let {http} = setup(t);
    return http({method : 'DELETE', url : 'api/1'}).then(response => {
      t.is(response, undefined);
    });
  });
  test('resolves with a value', function (t) {
    let {http} = setup(t);
    return http({method : 'GET', url : 'api/1'}).then(response => {
      t.is(response, 'returned');
    });
  });
  test('triggers a callback', function (t) {
    let {http} = setup(t);
    return http({method : 'post', url : 'api/1'}).then(response => {
      t.is(response, 'called');
    });
  });
  test.cb('does not resolve', function (t) {
    let {http} = setup(t);
    http({method : 'patch', url : 'api/1'}).then(() => t.fail(), () => t.fail());

    setTimeout(() => {t.end();}, 500);
  });
  test('rejects the promise', function (t) {
    let {http} = setup(t);
    return http({method : 'put', url : 'api/1'}).then(() => {
      t.fail();
    }, () => {
      t.pass();
    });
  });
});

describe('matching', function () {
  test('matches on strings', function (t) {
    let {http} = t.context;
    http.when('get', 'api/1');

    return http.get('api/1');
  });
  test('matches on regular expressions', function (t) {
    let {http} = t.context;
    http.when(/get/, /api\/\d/);

    return http.get('api/1');
  });
  test('matches only on url', function (t) {
    let {http} = t.context;
    http.when('api/1');

    return http.get('api/1');
  });
});
