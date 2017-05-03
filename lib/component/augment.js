var componentMethods = require('./component');

exports.augment = function (instance) {
  if (Object.hasOwnProperty.call(instance, '$name')){
    return;
  }
  Object.defineProperties(instance, {
    $name : {
      get : function () {
        return this.$options.name || '';
      }
    },
    $html : {
      get : function () {
        return this.$el && this.$el.outerHTML || '';
      }
    }
  });

  instance.$find = find;

  instance.$findOne = function (q) {
    return this.$find(q, null, true);
  };

  instance.$contains = function (q) {
    return !!this.$findOne(q);
  };
};


function find(q, options, first) {
  var result = [];

  if (typeof q === 'object'){
    q = q.name;
    if (!q){
      throw new Error('Component Definition must have a name property in order to find its instance');
    }
  }
  if (typeof q !== 'string' || !q){
    throw new Error('Invalid query: ' + JSON.stringify(q));
  }
  var deCamelCased = componentMethods.deCamelCase(q);
  var reCamelCased = componentMethods.reCamelCase(q);
  var reUpperCased = componentMethods.reUpperCase(reCamelCased);

  if (['.', '#', '['].indexOf(q.charAt(0)) < 0){
    // search components
    var children = this.$children.slice();
    while (children && children.length){
      for (var i = 0, l = children.length; i < l; i++){
        var component = children[i];
        switch(component.$options.name){
        case q:
        case deCamelCased:
        case reCamelCased:
        case reUpperCased:
          exports.augment(component);
          if (first){
            return component;
          }
          result.push(component);
          break;
        }
      }

      children = children.map(function (component) {
        return component.$children;
      });
      children = Array.prototype.concat.apply([], children);
    }
  }

  // search elements
  if (!result.length){
    try{
      result = Array.prototype.slice.call(this.$el.querySelectorAll(q));
    }catch(e){
      // not a valid css selector
    }
  }

  if (first){
    return result.length ? result[0] : null;
  }else{
    return result;
  }
}
