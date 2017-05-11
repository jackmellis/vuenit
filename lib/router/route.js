function Route(fullPath, matches) {
  var self = this;

  if (!matches.length){
    // create a dummy match
    matches.push({
      path : fullPath,
      fullPath : fullPath,
      exp : /.*/
    });
  }

  var match = matches[matches.length-1];

  this.params = {};
  this.query = {};
  this.hash = '';
  this.props = false;

  // Get Query
  var path = fullPath.split('?');
  if (path.length === 2){
    path.pop().split('&').forEach(function (q) {
      q = q.split('=');
      var key = q[0];
      var value = q.length === 2 ? q[1] : true;
      self.query[key] = value;
    });
  }
  path = path[0];

  // Get Hash
  path = path.split('#');
  if (path.length === 2){
    this.hash = '#' + path.pop();
  }
  path = path[0];

  // Get Params
  var paramKeys = match.fullPath.split('/')
    .filter(function (part) {
      return part.charAt(0) === ':';
    })
    .map(function (part) {
      return part.replace(/[:\+\*]/g, '');
    });
  var paramValues = match.exp.exec(path).slice(1);

  paramKeys.forEach(function (key, index) {
    self.params[key] = paramValues[index];
  });

  // Get Props
  if (typeof match.props === 'function'){
    this.props = match.props(this);
  }else if (match.props && typeof match.props === 'object'){
    this.props = Object.assign({}, match.props);
  }else if (match.props){
    this.props = {};
    Object.keys(this.params).forEach(function (key) {
      var value = self.params[key];
      self.props[key] = value;
    });
  }

  this.path = path;
  this.fullPath = fullPath;
  this.matched = matches;
}

Object.defineProperty(Route.prototype, '$$isMockRoute', {
  get : function () {
    return true;
  }
});

module.exports = Route;
