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
  createState(store.state, config.state, true);
  createGetters([], store.getters, store.state, config.getters, store, true);

  const reactive = this.reactify(store);

  return reactive;
};

class Store{
  constructor(){
    this.state = {};
    this.getters = {};
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

function createState(store, config, isRoot) {
  Object.keys(config).forEach(function (key) {
    if (key === 'default' && isRoot){
      createState(store, config[key]);
    }else if (isRoot){
      store[key] = {};
      createState(store[key], config[key]);
    }else{
      store[key] = config[key];
    }
  });
}

function createGetters(getterPath, getters, state, config, rootStore, isRoot) {
  Object.keys(config).forEach(function (key) {
    if (key === 'default' && isRoot){
      createGetters(getterPath, getters, state, config[key], rootStore);
    }else if (typeof config[key] !== 'function'){
      createGetters(getterPath.concat(key), getters, state[key], config[key], rootStore);
    }else{
      let g = getterPath.concat(key).join('/');
      let fn = config[key];
      let param = { state, rootState : rootStore.state };
      Object.defineProperty(getters, g, {
        enumerable : true,
        get(){
          return fn(param);
        }
      });
    }
  });
}
