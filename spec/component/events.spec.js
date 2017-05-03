import test from 'ava-spec';
import Sinon from 'sinon';
import vuenit from '../../lib';
import injector from 'vue-inject';

test.beforeEach(function (t) {
  var sinon = Sinon.sandbox.create();

  var component = {
    template : `<div>
                  <child-component @custom-event="e => $emit('custom-event', e)"/>
                </div>`,
    components : {
      childComponent : {
        template : '<div/>',
        methods : {
          fireEvent(){
            this.$emit('custom-event', 'foo');
          }
        }
      }
    }
  };
  var options = {
    name : 'test'
  };

  t.context = {sinon, component, options};
});

test('calls spy when event takes place', function (t) {
  let {component, sinon, options} = t.context;
  let spy = sinon.spy();
  options.on = {
    'custom-event' : spy
  };
  let vm = vuenit.component(component, options);

  vm.$emit('custom-event');

  t.true(spy.called);
});

test('calls spy when event is emitted from child component', function (t) {
  let {component, sinon, options} = t.context;
  let spy = sinon.spy();
  options.on = {
    'custom-event' : spy
  };
  let vm = vuenit.component(component, options);
  let child = vm.$findOne('child-component');

  child.fireEvent();

  t.true(spy.called);
});

test.todo('calls spy with arguments');
