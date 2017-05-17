import test from 'ava-spec';
import Sinon from 'sinon';
import vuenit from '../../lib';
import injector from 'vue-inject';

test.beforeEach(function (t) {
  var sinon = Sinon.sandbox.create();

  var localDirective = sinon.spy();
  var globalDirective = sinon.spy();

  var component = {
    directives : { localDirective },
    template : `<div>
      <span v-local-directive v-global-directive></span>
    </div>`
  };
  var options = {
    name : 'test',
    install(Vue){
      Vue.directive('global-directive', globalDirective);
    }
  };

  t.context = {sinon, component, options, localDirective, globalDirective};
});

test.group('directives', function (test) {
  test('check that local and global directives are called', function (t) {
    let {component, options, localDirective, globalDirective} = t.context;

    const vm = vuenit.component(component, options);

    t.true(localDirective.called);
    t.true(globalDirective.called);
  });
});

test.group('stubDirectives', function (test) {
  test('stubs all directives', function (t) {
    let {component, options, sinon, localDirective, globalDirective} = t.context;
    let spy = sinon.spy();

    options.stubDirectives = spy;
    let vm = vuenit.component(component, options);

    t.false(localDirective.called);
    t.false(globalDirective.called);
    t.true(spy.called);
  });
  test('stubs all directives with a fn by default', function (t) {
    let {component, options, localDirective, globalDirective} = t.context;

    options.stubDirectives = true;
    let vm = vuenit.component(component, options);

    t.false(localDirective.called);
    t.false(globalDirective.called);
  });
});
