var pathToRegexp = require('path-to-regexp');

function RouteRecord(config, pathParts, router, parent) {
  if (typeof config !== 'object'){
    config = { path : config };
  }
  Object.assign(this, config);

  pathParts = pathParts.concat(config.path);
  this.fullPath = pathParts.join('/');
  this.exp = pathToRegexp(this.fullPath);
  this.parent = parent;

  if (this.children){
    this.children = [].concat(this.children).map(function (route) {
      return new RouteRecord(route, pathParts, router, this);
    }.bind(this));
  }
  this.$router = router;
}

RouteRecord.prototype.activate = function (options) {
  this.$router.push(Object.assign({ path : this.fullPath}, options));
};

Object.defineProperty(RouteRecord.prototype, 'active', {
  get : function () {
    return this.exp.test(this.$router.currentRoute.fullPath.replace(/[\?\#]/, ''));
  }
});

module.exports = RouteRecord;
