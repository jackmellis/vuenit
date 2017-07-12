var componentMethods = require('./component');
var vuenit = require('../');
var exposeArray = require('./expose-array');
var helpers = require('../helpers');
var hasOwn = helpers.hasOwn;
var defineGetter = helpers.defineGetter;
var isElement = helpers.isElement;


// Add helper methods and properties to the vm
function augment(instance) {
  if (!hasOwn(instance, '$name')){
    defineGetter(instance, '$name', function () {
      return (this.$options && this.$options.name) || (isElement(this) && this.tagName.toLowerCase()) || '';
    }, true);
  }
  if (!hasOwn(instance, '$html')){
    defineGetter(instance, '$html', function () {
      return (this.$el && this.$el.outerHTML) || (isElement(this) && this.outerHTML) || '';
    }, true);
  }
  if (!hasOwn(instance, '$text')){
    defineGetter(instance, '$text', function () {
      var element = this.$el || (isElement(this) && this);
      return element && (element.textContent || element.innerText) || '';
    });
  }

  if (!instance.$find){
    instance.$find = find;
  }

  if (!instance.$findOne){
    instance.$findOne = function (q) {
      return this.$find(q, null, true);
    };
  }

  if (!instance.$contains){
    instance.$contains = function (q) {
      return !!this.$findOne(q);
    };
  }

  if (!instance.$trigger){
    instance.$trigger = function (evtName, args) {
      var el = (this.$el) || (isElement(this) && this) || null;
      if (el){
        return vuenit.trigger(el, evtName, args);
      }
    };
  }

  if (!instance.$create){
    instance.$create = function () {
      throw new Error('DEPRECATED: as of v1.0.0 vm.$create has been deprecated in favour of the vuenit.build method');
    };
  }
}

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

  if (this.$options){
    // check all variations of component name
    var deCamelCased = componentMethods.deCamelCase(q);
    var reCamelCased = componentMethods.reCamelCase(q);
    var reUpperCased = componentMethods.reUpperCase(reCamelCased);

    // only search components if it's definitely not a css selector
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
            if (first){
              return component;
            }
            result.push(component);
            break;
          }
        }

        // search components' children
        children = children.map(function (component) {
          return component.$children;
        });
        children = Array.prototype.concat.apply([], children);
      }
    }
  }

  // search elements
  if (!result.length){
    var el = (this.$el && (this.$el.parentElement || this.$el)) || (isElement(this) && this);
    try{
      if (first){
        result = [el.querySelector(q)];
      }else{
        result = Array.prototype.slice.call(el.querySelectorAll(q));
      }
      result.forEach(function (element) {
        augment(element);
      });
    }catch(e){
      // not a valid css selector
    }
    if (first){
      return result[0] || null;
    }
  }

  return exposeArray(result);
}

module.exports = augment;
