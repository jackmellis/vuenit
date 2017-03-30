var reactify = require('../reactify');
var create = require('./create');
var Store = require('./store');

module.exports = function (config) {
  if (!config){
    config = {};
  }
  if (config._isStore){
    return config;
  }

  var store = new Store();

  store = create(config, store, store.state, []);

  store.state = reactify(store.state);

  return store;
};
