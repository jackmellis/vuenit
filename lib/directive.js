module.exports = function (directives, options) {
  const mergedOptions = Object.assign({
    props : {},
    element : 'div',
    template : '<v-element v-directive></v-element>',
  }, options);
  options = Object.assign(options, mergedOptions);

  if (typeof directives === 'string'){
    let tmp = directives;
    directives = {};
    directives[tmp] = null;
  }

  const componentDirectives = {};

  let directiveString = Object.keys(directives)
    .map(directiveName => {
      const directive = directives[directiveName] || null;
      const opt = Object.assign({
        modifiers : [],
        argument : null,
        expression : null
      }, options, options[directiveName]);

      const attribute = ['v-', directiveName];

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

  const template = options.template
    .replace('v-directive', directiveString)
    .replace('v-element', options.element);

  const component = {
    name : 'directive-component',
    template,
    props : Object.keys(options.props),
    directives : componentDirectives
  };

  return this.component(component, options);
};
