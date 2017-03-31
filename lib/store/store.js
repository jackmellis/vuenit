var BaseInjector = require('vue-inject');

class Store{
  constructor(){
    this.state = {};
    this.getters = {};
    this._modulesNamespaceMap = {};

    Object.defineProperties(this, {
      $$when : {
        value : {}
      },
      $$isStore : {
        get : function(){ return true; }
      }
    });
  }

  dispatch(name, payload){
    var self = this;
    var pathToAction = name.split('/');
    pathToAction.pop();
    var localState = pathToAction.reduce(function (last, current) {
      return last && last[current];
    }, this.state);
    var rootState = this.state;
    var localCommit = function (name, payload) {
      var commitName = pathToAction.concat(name).join('/');
      return self.commit(commitName, payload);
    };
    var localDispatch = function (name, payload) {
      var dispatchName = pathToAction.concat(name).join('/');
      return self.dispatch(dispatchName, payload);
    };
    var getters = this.getters;
    var context = {
      state : localState,
      rootState : rootState,
      commit : localCommit,
      dispatch : localDispatch,
      getters : getters
    };

    return BaseInjector.spawn(true).get('$promise').resolve()
      .then(function(){
        return self.$$doWhen('dispatch', name, context, payload);
      });
  }
  commit(name, payload){
    var pathToCommit = name.split('/');
    pathToCommit.pop();
    var localState = pathToCommit.reduce(function (last, current) {
      return last && last[current];
    }, this.state);

    return this.$$doWhen('commit', name, localState, payload);
  }
  when(name){
    var callback = function(){};
    this.$$when[name] = function(){
      return callback.apply(this, arguments);
    };
    return {
      return : function (value) {
        callback = function(){
          return value;
        };
        return this;
      },
      call : function (cb) {
        callback = cb;
        return this;
      },
      stop : function () {
        callback = function(){
          return BaseInjector.spawn(true).get('$promise')(function(){});
        };
        return this;
      },
      throw : function (value) {
        callback = function(){
          throw (value || new Error());
        };
        return this;
      }
    };
  }
  $$doWhen(type, name){
    var args = Array.prototype.slice.call(arguments, 2);

    if (this.$$when[name]){
      return this.$$when[name].apply(this, args);
    }
  }
}

module.exports = Store;
