var mount = require('./component');
var helpers = require('./helpers');
var assign = helpers.assign;

module.exports = function (directives, options) {
  options = options || {};
  var defaultOptions = {
    props : {},
    element : 'div',
    template : '<v-element v-directive></v-element>',
    modifiers : [],
    argument : null,
    expression : null
  };
  var mergedOptions = assign(defaultOptions, module.exports.config, options);
  options = assign(options, mergedOptions);

  var componentDirectives = {};

  var directiveString = [].concat(directives).map(function(directiveObj){
    if (typeof directiveObj === 'string'){
      (function(){
        var tmp = directiveObj;
        directiveObj = {};
        directiveObj[tmp] = null;
      }());
    }

    return Object.keys(directiveObj).map(function (directiveName) {
      var directive = directiveObj[directiveName] || null;
      var opt = assign({
        modifiers : [],
        argument : null,
        expression : null
      }, options, options[directiveName]);

      var attribute;
      if (directiveName.substr(0, 2) === 'v-'){
        attribute = [directiveName];
        directiveName = directiveName.substr(2);
      }else{
        attribute = ['v-', directiveName];
      }

      if (opt.argument){
        attribute.push(':', opt.argument);
      }
      if (opt.modifiers && opt.modifiers.length){
        attribute.push('.', [].concat(opt.modifiers).join('.'));
      }
      if (opt.expression){
        attribute.push('="', opt.expression, '"');
      }

      if (directive){
        componentDirectives[directiveName] = directive;
      }

      return attribute.join('');
    }).join(' ');
  }).join(' ');

  var template = options.template
    .replace('v-directive', function(){ return directiveString; })
    .replace('v-element', function(){ return options.element; });

  var component = {
    name : 'directive-component',
    template : template,
    props : Object.keys(options.props),
    directives : componentDirectives
  };

  return mount(component, options);
};
module.exports.config = {};
