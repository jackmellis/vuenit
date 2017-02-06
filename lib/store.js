module.exports = function (config) {
  if (!config){
    config = {};
  }
  if (config._isStore){
    return config;
  }
  if (!config.state && !config.getters){
    config = { state : config };
  }
  if (!config.state){
    config.state = {};
  }
  if (!config.getters){
    config.getters = {};
  }
  const store = new Store();
  createState(store, store._modulesNamespaceMap, store.state, config.state, [], true);
  createGetters(store, store._modulesNamespaceMap, store.state, store.getters, config.getters, [], true);

  const reactive = this.reactify(store);

  return reactive;
};

class Store{
  constructor(){
    this.state = {};
    this.getters = {};
    this._modulesNamespaceMap = {};
    this.whenDefault = function(){};

    Object.defineProperties(this, {
      _when : {
        value : {}
      },
      _isStore : {
        get : () => true
      }
    });
  }

  dispatch(name, payload){
    return Promise.resolve().then(() => this._doWhen('dispatch', name, payload));
  }
  commit(name, payload){
    return this._doWhen('commit', name, payload);
  }
  when(name, callback){
    this._when[name] = callback;
  }
  _doWhen(type, name, payload){
    if (this._when[name]){
      return this._when[name].call(this, payload);
    }else{
      return this.whenDefault.call(this, type, name, payload);
    }
  }
}

function createState(store, modules, state, config, path, isRoot) {
  Object.keys(config).forEach(function (key) {
    var value = config[key];
    if (key === 'default' && isRoot){
      createState(store, modules, state, config[key], path);
    }else if (isRoot){
      var mKey = path.concat(key, '').join('/');
      var localState = {};
      state[key] = localState;
      modules[mKey] = modules[mKey] || { context : { getters : {} } };
      modules[mKey].state = localState;
      createState(store, modules, state[key], value, path.concat(key));
    }else{
      state[key] = config[key];
    }
  });
}

function createGetters(store, modules, state, getters, config, path, isRoot) {
  Object.keys(config).forEach(function (key) {
    var value = config[key];
    if (key === 'default' && isRoot){
      createGetters(store, modules, state, getters, value, path);
    }else if (typeof value !== 'function'){
      createGetters(store, modules, state[key], getters, value, path.concat(key));
    }else{
      var gKey = path.concat(key).join('/');
      var mKey = gKey + '/';
      let params = { state : state, rootState : store.state };
      modules[mKey] = modules[mKey] || { state : state, context : { getters : {} } };

      Object.defineProperty(getters, gKey, {
        enumerable : true,
        get : function () {
          return value(params);
        }
      });
      Object.defineProperty(modules[mKey].context.getters, key, {
        enumerable : true,
        get : function () {
          return value(params);
        }
      });
    }
  });
}
