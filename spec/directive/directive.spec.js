import test from 'ava-spec';
import vuenit from '../../lib';
import Sinon from 'sinon';

test.beforeEach(function (t) {
  let sinon = Sinon.sandbox.create();
  let directive = {
    test : function(el, binding){
      t.context.el = el;
      t.context.binding = binding;
    }
  };
  let options = {
    props : {
      x : 1,
      y : 2
    }
  };
  let directives = ['if', 'v-show', directive];

  t.context = {sinon, directive, directives, options};
});
test.afterEach(function (t) {
  t.context.sinon.restore();
});

test('creates a component with a directive', function (t) {
  let {directives, options} = t.context;
  let vm = vuenit.directive(directives, options);

  t.not(vm, undefined);
  t.is(t.context.binding.rawName, 'v-test');
});

test('creates a component with multiple directives', function (t) {
  let {directive, options} = t.context;
  let vm = vuenit.directive(directive, options);

  t.not(vm, undefined);
  t.is(t.context.binding.rawName, 'v-test');
});
test('attaches an expression to the directive', function (t) {
  let {directive, options} = t.context;
  options.expression = 'x + y';
  let vm = vuenit.directive(directive, options);

  t.is(t.context.binding.expression, 'x + y');
  t.is(t.context.binding.value, 3);
});

test('attaches an argument to the directive', function (t) {
  let {directive, options} = t.context;
  options.argument = 'click';
  let vm = vuenit.directive(directive, options);

  t.is(t.context.binding.arg, 'click');
});

test('attaches modifiers to the directive', function (t) {
  let {directive, options} = t.context;
  options.modifiers = ['foo', 'bah'];
  let vm = vuenit.directive(directive, options);

  t.is(t.context.binding.modifiers.foo, true);
  t.is(t.context.binding.modifiers.bah, true);
});

test('attaches the directive to a custom element', function (t) {
  let {directive, options} = t.context;
  options.element = 'span';
  let vm = vuenit.directive(directive, options);

  let indexOfSpan = t.context.el.outerHTML.indexOf('<span>');

  t.is(indexOfSpan, 0);
});

test('attaches the directive to a custom template', function (t) {
  let {directive, options} = t.context;
  options.template = '<input v-directive>';
  let vm = vuenit.directive(directive, options);

  var html = t.context.el.outerHTML;

  t.is(html, '<input>');
});

test.group('directive config', function (test) {
  test('directive options inherit config options', function (t) {
    let {directive, options} = t.context;
    vuenit.directive.config = { element : 'output' };

    let vm = vuenit.directive(directive, options);
    let html = t.context.el.outerHTML;

    t.is(html.indexOf('<output>'), 0);
  });
  test('specified options still take presidence', function (t) {
    let {directive, options} = t.context;
    vuenit.directive.config = {
      props : {
        x : 'con',
        y : 'fig'
      }
    };

    let vm = vuenit.directive(directive);
    t.is(vm.x, 'con');
    t.is(vm.y, 'fig');

    vm = vuenit.directive(directive, options);
    t.is(vm.x, 1);
    t.is(vm.y, 2);
  });
});
