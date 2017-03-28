var vuenit = require('../lib');
var injector = require('vue-inject');
var mocks = require('jpex-mocks');
injector.use(mocks);

var http = vuenit.http();

http.when('/api/1').return('returned');
http.when('post', '/api/2').call(() => 'called');
http.when('put', /^\/api\/3$/).reject('rejected');
http.when('post', '/api/3').stop();
debugger;
http.otherwise().call(() => 'unknown?');

http.patch('/api/1')
.then(function (response) {
  return http.post('/api/2', response);
})
.then(function (response) {
  return http.put('/api/3', response);
})
.catch(function (response) {
  http.when('post', '/api/3').return();
  return http({ method : 'post', url : '/api/3', data : response});
})
.then(function (response) {
  debugger;
  return http.get('unknown!');
});

http.flush();

http.flush();
