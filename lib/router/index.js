var Router = require('./router');

module.exports = function (config, initialPath) {
  if (!config || typeof config !== 'object' || Array.isArray(config)){
    config = {
      routes : [].concat(config || [])
    };
  }
  if (!config.routes){
    config.routes = [];
  }
  if (!config.routes.length){
    config.routes.push({ path : '/' });
  }
  if (!config.route && initialPath){
    config.route = initialPath;
  }

  var $router = new Router(config);

  return {
    $router : $router,
    $route : $router.$coreRoute
  };
};
