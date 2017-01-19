module.exports = function (directive, options) {
  options = Object.assign({
    modifiers : [],
    props : {},
    template : '<div v-directive></div>',
    argument : null,
    expression : null
  }, options);

  const directiveName = (typeof directive === 'string') ? directive : Object.keys(directive)[0];
  if (directive === directiveName){
    directive = null;
  }

  let attribute = ['v-', directiveName];

  if (options.argument){
    attribute.push(':', options.argument);
  }
  if (options.modifiers && options.modifiers.length){
    attribute.push('.', [].concat(options.modifiers).join('.'));
  }
  if (options.expression){
    attribute.push('="', options.expression, '"');
  }

  attribute = attribute.join('');

  const template = options.template.replace('v-directive', attribute);

  const component = {
    name : 'directive-component',
    template,
    props : Object.keys(options.props),
    directives : directive
  };

  return this.component(component, options);
};
