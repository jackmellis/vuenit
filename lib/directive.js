var mockComponent = require('./component');

module.exports = function (directives, options) {
  options = options || {};
  var mergedOptions = Object.assign({
    props : {},
    element : 'div',
    template : '<v-element v-directive></v-element>',
    modifiers : [],
    argument : null,
    expression : null
  }, options);
  options = Object.assign(options, mergedOptions);

  if (typeof directives === 'string'){
    (function(){
      var tmp = directives;
      directives = {};
      directives[tmp] = null;
    }());
  }

  var componentDirectives = {};

  var directiveString = Object.keys(directives)
    .map(directiveName => {
      var directive = directives[directiveName] || null;
      var opt = Object.assign({
        modifiers : [],
        argument : null,
        expression : null
      }, options, options[directiveName]);

      var attribute = ['v-', directiveName];

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

  var template = options.template
    .replace('v-directive', directiveString)
    .replace('v-element', options.element);

  var component = {
    name : 'directive-component',
    template : template,
    props : Object.keys(options.props),
    directives : componentDirectives
  };

  return mockComponent(component, options);
};
