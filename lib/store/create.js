var BaseInjector = require('vue-inject');
var $typeof = BaseInjector.get('$typeof');

module.exports = create;

function create(config, store, state, path) {
  if (!config.state && !config.getters && !config.mutations && !config.actions && !config.modules){
    config = {
      state : config,
      modules : {}
    };
    Object.keys(config.state).forEach(function (key) {
      var v = config.state[key];
      if ($typeof(v) === 'object'){
        config.modules[key] = v;
      }
    });
  }
  if (!config.state){
    config.state = {};
  }
  if (!config.getters){
    config.getters = {};
  }
  if (!config.mutations){
    config.mutations = {};
  }
  if (!config.actions){
    config.actions = {};
  }
  if (!config.modules){
    config.modules = {};
  }

  createState(store, store._modulesNamespaceMap, state, config.state, path);

  createGetters(store, store._modulesNamespaceMap, state, store.getters, config.getters, path);
  createCommits(store, store._modulesNamespaceMap, state, config.mutations, path);
  createActions(store, store._modulesNamespaceMap, state, config.actions, path);

  createModules(store, store._modulesNamespaceMap, state, config.modules, path);

  return store;
};

function createModules(store, modules, state, config, path) {
  Object.keys(config).forEach(function (key) {
    var module = config[key];
    var moduleKey = path.concat(key, '').join('/');

    var localState = {};
    state[key] = localState;

    modules[moduleKey] = modules[moduleKey] || generateModuleNamespace();
    modules[moduleKey].context.state = localState;

    create(module, store, localState, path.concat(key));
  });
}

function generateModuleNamespace() {
  return {
    context : {
      getters : {},
      state : {}
    }
  };
}

function createState(store, modules, state, config, path) {
  Object.keys(config).forEach(function (key) {
    var value = config[key];
    state[key] = value;
  });
}

function createGetters(store, modules, state, getters, config, path) {
  var localGetters = {};

  Object.keys(config).forEach(function (key) {
    var value = config[key];

    var getterKey = path.concat(key).join('/');
    var moduleKey = path.concat('').join('/');

    modules[moduleKey] = modules[moduleKey] || generateModuleNamespace();

    var property = {
      enumerable : true,
      get : function () {
        return value(state, localGetters, store.state);
      }
    };

    Object.defineProperty(localGetters, key, property);
    Object.defineProperty(modules[moduleKey].context.getters, key, property);
    Object.defineProperty(getters, getterKey, property);
  });
}

function createCommits(store, modules, state, config, path){
  Object.keys(config).forEach(function (key) {
    var value = config[key];
    var getterKey = path.concat(key).join('/');
    if (typeof value !== 'function'){
      store.when(getterKey).return(value);
    }else{
      store.when(getterKey).call(value);
    }
  });
}

function createActions(store, modules, state, config, path, isRoot){
  Object.keys(config).forEach(function (key) {
    var value = config[key];
    var getterKey = path.concat(key).join('/');
    if (typeof value !== 'function'){
      store.when(getterKey).return(value);
      createActions(store, modules, state[key], value, path.concat(key));
    }else{
      store.when(getterKey).call(value);
    }
  });
}
