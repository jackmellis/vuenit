import test from 'ava-spec';
import Sinon from 'sinon';
import vuenit from '../../lib';
import injector from 'vue-inject';

test.beforeEach(function (t) {
  var sinon = Sinon.sandbox.create();
  var spy = sinon.spy();

  var component = {
    template : `<div>
                  <child-component @click="e => $emit('click', e)"/>
                  <child-component @click="e => $emit('click', e)"/>
                </div>`,
    components : {
      childComponent : {
        template : `<button @click="e => $emit('click', e)"></button>`
      }
    }
  };
  var options = {
    name : 'test',
    on : {
      click : spy
    }
  };

  var vm = vuenit.component(component, options);

  t.context = {sinon, component, options, spy, vm};
});

test('should throw if no target supplied', function (t) {
  t.throws(() => vuenit.trigger());
});

test('should throw if target is not a valid object', function (t) {
  t.throws(() => vuenit.trigger({}));
});

test('trigger an event on an element', function (t) {
  let {vm, spy} = t.context;
  let btn = vm.$findOne('button');
  t.false(spy.called);

  vuenit.trigger(btn, 'click');

  t.true(spy.calledOnce);
});

test('trigger an event on multiple elements', function (t) {
  let {vm, spy} = t.context;
  let btns = vm.$find('button');
  t.false(spy.called);

  vuenit.trigger(btns, 'click');

  t.true(spy.calledTwice);
});

test('trigger an event on a component', function (t) {
  let {vm, spy} = t.context;
  vuenit.trigger(vm.$findOne('childComponent'), 'click');

  t.true(spy.calledOnce);
});

test('trigger an event with arguments', function (t) {
  let {vm} = t.context;
  let btn = vm.$findOne('button');
  let result;
  vm.$on('click', r => result = r);

  vuenit.trigger(btn, 'click', { foo : 'bah' });

  t.is(result.foo, 'bah');
});

test('trigger an event with an Event class', function (t) {
  let {vm} = t.context;
  let btn = vm.$findOne('button');
  let result;
  let evt = new Event('click');
  vm.$on('click', r => result = r);

  vuenit.trigger(btn, evt);

  t.is(result, evt);
});

test('includes target element', function (t) {
  let {vm} = t.context;
  let btn = vm.$findOne('button');
  let result;
  vm.$on('click', r => result = r);

  vuenit.trigger(btn, 'click');

  t.is(result.target, btn);
});
