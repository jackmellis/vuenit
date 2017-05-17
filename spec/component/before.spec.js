import test from 'ava';
import sinon from 'sinon';
import vuenit from '../../lib';

test.beforeEach(t => {
  let component = {
    name : 'test',
    template : `<div>
      <button @click="onClick"></button>
    </div>`,
    methods : {
      onClick(){

      }
    }
  };

  t.context = {component};
});

test('it calls before hook before instantiating', t => {
  let spy = sinon.spy();
  let vm = vuenit.component(t.context.component, {
    before : spy
  });

  t.true(spy.called);
});

test('it allows modifications to the component', t => {
  let spy = sinon.spy();
  let before = function (component) {
    component.methods.onClick = spy;
  };
  let vm = vuenit.component(t.context.component, {before});

  vm.onClick();

  t.true(spy.called);
});

test('component has been processed', t => {
  t.plan(3);
  let before = function (c) {
    t.is(typeof c.render, 'function');
    t.true(!!c.directives);
    t.true(!!c.components);
  };
  vuenit.component(t.context.component, {before});
});

test('it has an options argument', t => {
  t.plan(3);
  let before = function (component, options) {
    t.true(options.shallow);
    t.is(typeof options.stubComponents.render, 'function');
    t.is(options.install, null);
  };
  vuenit.component(t.context.component, {before, shallow : true});
});

test('it does not affect the original component', t => {
  let {component} = t.context;
  let spy = sinon.spy();
  vuenit.component(component, {
    before(c){
      c.methods.onClick = spy
    }
  });

  t.not(component.methods.onClick, spy);
  component.methods.onClick();
  t.false(spy.called);
});

test('real world example', t => {
  let spy = sinon.spy();
  let before = function (component) {
    component.methods.onClick = spy;
  };
  let vm = vuenit.component(t.context.component, {before});

  let button = vm.$findOne('button');
  vuenit.trigger(button, 'click');

  t.true(spy.called);
});
