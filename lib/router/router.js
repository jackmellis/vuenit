var Route = require('./route');
var RouteRecord = require('./routerecord');
var pathToRegexp = require('path-to-regexp');

function Router(config){
  Object.defineProperties(this, {
    $vms : {
      value : []
    },
    $ctors : {
      value : []
    },
    $position : {
      writable : true,
      value : -1
    }
  });
  this.routes = [];
  this.history = [];
  this.addRoutes(config.routes);
  this.push(config.route || this.routes[0].path);
}

Router.prototype.addRoutes = function (routes) {
  var self = this;
  [].concat(routes).forEach(function (route) {
    self.routes.push(new RouteRecord(route, [], self));
  });
};

Router.prototype.push = function (path) {
  path = this.$buildPath(path);
  var matches = this.$findMatchingRouteRecords(path);
  var route = new Route(path, matches);

  this.$position++;
  this.history.splice(this.$position, 0, route);

  if (!this.$coreRoute){
    this.$coreRoute = new Route(path, matches);
  }else{
    Object.assign(this.$coreRoute, route);
  }
  this.$notify();
};

Router.prototype.replace = function (path) {
  path = this.$buildPath(path);
  var matches = this.$findMatchingRouteRecords(path);
  var route = new Route(path, matches);
  var n = this.$position;

  this.history.splice(n, 1, route);
  Object.assign(this.$coreRoute, route);
  this.$notify();
};

Router.prototype.go = function (n) {
  if (n >= this.history.length){
    n = this.history.length;
  }else if (n < 0){
    n = 0;
  }
  this.$position = n;
  var route = this.history[n];
  Object.assign(this.$coreRoute, route);
  this.$notify();
};

Router.prototype.back = function () {
  var n = this.$position < 1 ? 0 : this.$position - 1;
  this.$position = n;
  var route = this.history[n];
  Object.assign(this.$coreRoute, route);
  this.$notify();
};

Router.prototype.forward = function () {
  var n = this.$position === this.history.length - 1 ? this.history.length - 1 : this.$position + 1;
  this.$position = n;
  var route = this.history[n];
  Object.assign(this.$coreRoute, route);
  this.$notify();
};

Router.prototype.$buildPath = function (options) {
  if (typeof options === 'string'){
    return options;
  }
  var path = options.path;
  if (options.name){
    var route = this.$getAllRoutes(this.routes).find(function (route) {
      return route.name === options.name;
    });
    path = route ? route.fullPath : '/' + options.name;
  }
  if (options.params){
    path = pathToRegexp.compile(path)(options.params);
  }
  if (options.hash){
    path = path + (options.hash.charAt(0) === '#' ? '' : '#') + options.hash;
  }
  if (options.query){
    path = path + '?' + Object.keys(options.query).map(function (key) {
      return key + '=' + options.query[key];
    }).join('&');
  }
  return path;
};

Router.prototype.$findMatchingRouteRecords = function (path) {
  path = path.replace(/[\?\#].*/, '');
  var result = [];
  var allRoutes = this.$getAllRoutes(this.routes);
  var found = allRoutes.find(function (route) {
    return route.exp.test(path);
  });
  while (found){
    result.unshift(found);
    found = found.parent;
  }
  return result;
};

Router.prototype.$getAllRoutes = function (routes) {
  var self = this;
  var result = [];
  routes.forEach(function (route) {
    result.push(route);
    if (route.children){
      result = result.concat(self.$getAllRoutes(route.children));
    }
  });
  return result;
};

Router.prototype.$notify = function () {
  var newRoute = this.currentRoute;
  this.$vms.forEach(function (vm) {
    vm.$route = newRoute;
    if (newRoute.props){
      Object.keys(newRoute.props).forEach(function (key) {
        var value = newRoute.props[key];
        vm.propsData[key] = value;
      });
    }
  });
};

Object.defineProperties(Router.prototype, {
  currentRoute : {
    get : function () {
      return this.history[this.$position];
    }
  },
  $$isMockRouter : {
    get : function () {
      return true;
    }
  }
});

module.exports = Router;
