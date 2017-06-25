import test from 'ava-spec';
import Sinon from 'sinon';
import vuenit from '../../lib';
import injector from 'vue-inject';

test.beforeEach(function (t) {
  var sinon = Sinon.sandbox.create();

  var componentC = {
    name : 'componentC',
    props : ['propValue'],
    template : '<input id="component-c-input" :value="propValue" type="text" class="component-c-input">'
  };
  var componentB = {
    template : '<div/>'
  };
  var componentA = {
    props : ['propValue'],
    components : {componentC},
    data(){
      return {
        dataA : 'dataA'
      };
    },
    template : '<component-c :prop-value="propValue"/>'
  };

  var component = {
    data(){
      return {
        dataA : 'dataA'
      };
    },
    components : {componentA, componentB},
    template : `
    <div>
      <div class="class-a">Class A</div>
      <div id="id-a" class="class-b">Id A</div>
      <component-a :prop-value="dataA"/>
      <component-b></component-b>
    </div>`
  };
  var options = {
    name : 'test',
    components : {
      componentB : '<div id="stubbed-component-b"/>'
    }
  };

  t.context = {sinon, component, options, componentA, componentB, componentC};
});

test.group('find component', function (test) {
  test('throws if an invalid query is provided', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);

    t.throws(() => vm.$find({}));
    t.throws(() => vm.$find(true));
  });
  test('finds a component by name', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$find('component-a');

    t.not(found, undefined);
    t.true(Array.isArray(found));
    t.is(found.length, 1);
    t.is(found[0].$options.name, 'componentA');

    t.is(found[0], vm.$find('componentA')[0]);
    t.is(found[0], vm.$find('ComponentA')[0]);
  });
  test('finds a component by a component definition', function (t) {
    let {component, componentA, options} = t.context;
    let vm = vuenit.component(component, options);
    componentA.name = 'componentA';
    let found = vm.$find(componentA);
    t.is(found.length, 1);
  });
  test('finds a component that is not a direct child', function (t) {
    let {component, options, componentC} = t.context;
    componentC.name = 'component-c';
    let vm = vuenit.component(component, options);
    let found = vm.$find('componentC');

    t.is(found.length, 1);
    t.is(found[0].$options.name, 'component-c');
  });
  test('finds a stubbed component', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$find('componentB');

    t.is(found.length, 1);
    t.is(found[0].$options.name, 'componentB');
  });
  test('returns an empty array', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$find('dont-find-anything-please');
    t.is(found.length, 0);
  });
  test('augments component with vuenit properties', function (t) {
    let {component, options, componentC} = t.context;
    componentC.name = 'componentC';
    let vm = vuenit.component(component, options);
    let found = vm.$find('componentA')[0];

    t.is(found.$name, 'componentA');
    t.true(found.$html.indexOf('<input') === 0);

    let foundC = found.$find('componentC');
    t.is(foundC.length, 1);
    t.is(foundC[0].$name, 'componentC');
  });

  test('proxies component properties', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$find('componentA');
    t.is(found.$name, 'componentA');
    t.is(found.dataA, 'dataA');
  });
  test('has array looping methods', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$find('componentA');

    t.is(found.length, 1);
    t.true(found.every(c => c.$name === 'componentA'));
    t.is(found.filter(c => true).length, 1);
    t.is(found.map(c => c.$name).find(() => true), 'componentA');
  });
  test('has push/pop methods', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$find('componentA');

    t.is(found.length, 1);
    found.push({$name : 'foo'});
    t.is(found.length, 2);
    t.is(found[1].$name, 'foo');

    t.is(found.pop().$name, 'foo');
    t.is(found.length, 1);

    found.unshift({$name : 'bah'});
    t.is(found.length, 2);
    t.is(found[0].$name, 'bah');

    t.is(found.shift().$name, 'bah');
    t.is(found.length, 1);

    found.splice(0, 1, {$name : 'zoo'});
    t.is(found.length, 1);
    t.is(found[0].$name, 'zoo');
  });
  test('can concat another array', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$find('componentA');

    let arr = [].concat(found);

    t.is(arr.length, 1);
    let test = arr[0] === found;
    t.false(test);
  });

  test('finds a single component', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$findOne('componentA');

    t.not(found, undefined);
    t.false(Array.isArray(found));
    t.is(found.$name, 'componentA');
  });
  test('returns null', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$findOne('componentD');

    t.is(found, null);

    found = vm.$findOne('!@£$%^&*¡€#¢∞§¶•');
    t.is(found, null);
  });
});

test.group('find element', function (test) {
  test('finds an element by class selector', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$find('.class-a,.class-b');

    t.is(found.length, 2);
    t.is(found[0].tagName, 'DIV');
    t.is(found[1].id, 'id-a');
  });
  test('finds an element by id selector', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$find('#id-a');

    t.is(found.length, 1);
    t.is(found[0].tagName, 'DIV');
    t.is(found[0].id, 'id-a');
  });
  test('finds an element by tag selector', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$find('input');

    t.is(found.length, 1);
    t.is(found[0].getAttribute('type'), 'text');
  });

  test('finds one matching element', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$findOne('input#component-c-input');

    t.is(found.getAttribute('type'), 'text');
  });
  test('returns null', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let found = vm.$findOne('.unknown-class');

    t.is(found, null);
  });
});

test.group('contains component', function (test) {
  test('returns true if contains component', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let contains = vm.$contains('componentB');

    t.true(contains);
  });
  test('returns true if component exists somewhere in the component tree', function (t) {
    let {component, options, componentC} = t.context;
    let vm = vuenit.component(component, options);
    let contains = vm.$contains(componentC);

    t.true(contains);
  });
  test('returns false if component does not exist', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let contains = vm.$contains('componentD');

    t.false(contains);
  });
});

test.group('contains element', function (test) {
  test('returns true if contains element', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let contains = vm.$contains('.component-c-input');

    t.true(contains);
  });
  test('returns false if does not contain element', function (t) {
    let {component, options} = t.context;
    let vm = vuenit.component(component, options);
    let contains = vm.$contains('.who-bloody-knows');

    t.false(contains);
  });
});
