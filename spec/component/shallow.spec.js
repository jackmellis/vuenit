import test from 'ava-spec';
import sinon from 'sinon';
import vuenit from '../../lib';

test.test.beforeEach(t => {
  let localComponent = {
    template : '<div id="local-component">l</div>'
  };
  let localDirective = sinon.spy();
  let localFilter = sinon.stub().callsFake(function(){
    return 'filtered';
  });

  let component = {
    name : 'c',
    components : {localComponent},
    directives : {localDirective},
    filters : {localFilter},
    template : `<div v-local-directive>
      <local-component/>
      <span>{{'plain' | localFilter}}</span>
    </div>`
  };

  t.context = {component, localDirective, localFilter};
});

test('renders correctly', t => {
  let {component, localDirective, localFilter} = t.context;
  let vm = vuenit.component(component);

  t.true(vm.$contains('#local-component'));
  t.true(localDirective.called);
  t.true(localFilter.called);
  t.true(vm.$html.indexOf('filtered') > -1);
});

test('shallow renders', t => {
  let {component, localDirective, localFilter} = t.context;
  let vm = vuenit.component(component, { shallow : true });

  t.false(vm.$contains('#local-component'));
  t.false(localDirective.called);
  t.false(localFilter.called);
  t.true(vm.$html.indexOf('plain') > -1);
});

test('renders with shallow method', t => {
  let {component, localDirective, localFilter} = t.context;
  let vm = vuenit.shallow(component);

  t.false(vm.$contains('#local-component'));
  t.false(localDirective.called);
  t.false(localFilter.called);
  t.true(vm.$html.indexOf('plain') > -1);
});
