var Route = require('./route');
var RouteRecord = require('./routerecord');
var pathToRegexp = require('path-to-regexp');

function Router(config){
  Object.defineProperties(this, {
    $vm : {
      writable : true,
      value : null
    },
    $position : {
      writable : true,
      value : -1
    },
    $beforeHooks : {
      value : []
    },
    $afterHooks : {
      value : []
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

Router.prototype.beforeEach = function (callback) {
  this.$beforeHooks.push(callback);
};

Router.prototype.afterEach = function (callback) {
  this.$afterHooks.push(callback);
};

Router.prototype.push = function (path) {
  path = this.$buildPath(path);
  var matches = this.$findMatchingRouteRecords(path);
  var route = new Route(path, matches);

  if (!this.$coreRoute){
    this.$coreRoute = new Route(path, matches);
  }

  this.$changeRoute(route, function () {
    Object.assign(this.$coreRoute, route);
    this.$position++;
    this.history.splice(this.$position, 0, route);
  }.bind(this));
};

Router.prototype.replace = function (path) {
  path = this.$buildPath(path);
  var matches = this.$findMatchingRouteRecords(path);
  var route = new Route(path, matches);
  var n = this.$position;

  this.$changeRoute(route, function () {
    Object.assign(this.$coreRoute, route);
    this.history.splice(n, 1, route);
    this.$notify();
  }.bind(this));
};

Router.prototype.go = function (n) {
  n = this.$position + n;

  if (n >= this.history.length){
    n = this.history.length;
  }else if (n < 0){
    n = 0;
  }
  var route = this.history[n];

  this.$changeRoute(route, function () {
    this.$position = n;
    Object.assign(this.$coreRoute, route);
  }.bind(this));
};

Router.prototype.back = function () {
  var n = this.$position < 1 ? 0 : this.$position - 1;
  var route = this.history[n];

  this.$changeRoute(route, function(){
    this.$position = n;
    Object.assign(this.$coreRoute, route);
  }.bind(this));
};

Router.prototype.forward = function () {
  var n = this.$position === this.history.length - 1 ? this.history.length - 1 : this.$position + 1;
  var route = this.history[n];

  this.$changeRoute(route, function () {
    this.$position = n;
    Object.assign(this.$coreRoute, route);
  }.bind(this));
};

Router.prototype.$buildPath = function (options) {
  if (typeof options === 'string'){
    return options;
  }
  var path = options.path;
  if (options.name){
    path = '/' + options.name;
    var allRoutes = this.$getAllRoutes(this.routes);
    for (var x = 0, l = allRoutes.length; x < l; x++){
      if (allRoutes[x].name === options.name){
        path = allRoutes[x].fullPath;
        break;
      }
    }
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
  var found;
  for (var x = 0, l = allRoutes.length; x < l; x++){
    if (allRoutes[x].exp.test(path)){
      found = allRoutes[x];
      break;
    }
  }
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

function getBeforeRouteEnter(to, vm) {
  var routeRecord = to.matched[to.matched.length-1];
  var component = routeRecord.component;

  return vm && vm.$options.beforeRouteEnter &&
  (!component || component === vm.$options.name || component.name === vm.$options.name) &&
  vm.$options.beforeRouteEnter.bind(null);
}
function getBeforeRouteUpdate(to, vm) {
  var routeRecord = to.matched[to.matched.length-1];
  var component = routeRecord.component;

  return vm && vm.$options.beforeRouteUpdate &&
  (!component || component === vm.$options.name || component.name === vm.$options.name) &&
  vm.$options.beforeRouteUpdate.bind(vm);
}
function getBeforeRouteLeave(from, vm) {
  var routeRecord = from.matched[from.matched.length-1];
  var component = routeRecord.component;

  return vm && vm.$options.beforeRouteLeave &&
  (!component || component === vm.$options.name || component.name === vm.$options.name) &&
  vm.$options.beforeRouteLeave.bind(vm);
}

Router.prototype.$changeRoute = function (to, done) {
  var self = this;
  var from = this.currentRoute;
  var beforeHooks = [];
  var afterHooks = [];

  if (from){
    if (to.matched[to.matched.length-1] === from.matched[from.matched.length-1]){
      // Same route, different query/params
      beforeHooks = [].concat(
        getBeforeRouteUpdate(to, this.$vm) || []
      );
    }else{
      beforeHooks = beforeHooks.concat(
        getBeforeRouteLeave(from, this.$vm) || [],
        this.$beforeHooks,
        to.matched[to.matched.length-1].beforeEnter || [],
        getBeforeRouteEnter(to, this.$vm) || []
        );
      afterHooks = afterHooks.concat(this.$afterHooks);
    }
  }

  function next(arg) {
    if (arg === false || arg instanceof Error){
      return; // abort
    }else if (arg){
      return self.replace(arg);
    }

    if (beforeHooks.length){
      beforeHooks.shift()(to, from, next);
    }else{
      done();
      self.$notify();
      afterHooks.forEach(function (hook) {
        hook(to, from);
      });
    }
  }

  next();
};

Router.prototype.$notify = function () {
  var newRoute = this.currentRoute;
  var vm = this.$vm;
  if (vm){
    vm.$route = newRoute;
    if (newRoute.props){
      Object.keys(newRoute.props).forEach(function (key) {
        var value = newRoute.props[key];
        vm.propsData[key] = value;
      });
    }
  }
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
