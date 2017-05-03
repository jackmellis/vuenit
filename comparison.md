## mounting
### avoriaz
```js
const vm = avoriaz.mount(c);
```

### vue-test
```js
const vm = vueTest.mount(c);
```

### vue-unit
```js
t.beforeEach(vueUnit.beforeEachHooks);
vueUnit.mount(c);
t.afterEach(vueUnit.afterEachHooks);
```

### vuenit
```js
const vm = vuenit.component(c);
```

## computed properties
### avoriaz
```js
t.is(vm.computed().foo(), 'foo');
```

### vue-test
???

### vue-unit
```js
t.is(vm.foo, 'foo');
```

### vuenit
```js
t.is(vm.foo, 'foo');
```

## methods
### avoriaz
```js
t.is(vm.methods().foo(), 'foo');
```

### vue-test
???

### vue-unit
```js
t.is(vm.foo(), 'foo');
```

### vuenit
```js
t.is(vm.foo(), 'foo');
```

## access data
### avoriaz
```js
t.is(vm.data().foo, 'foo');
```

### vue-test
???

### vue-unit
```js
t.is(vm.foo, 'foo');
```

### vuenit
```js
t.is(vm.foo, 'foo');
```

## update data
### avoriaz
```js
vm.setData({ foo : 'bah' });
t.is(vm.data().foo, 'bah');
```

### vue-test
???

### vue-unit
```js
vm.foo = 'bah';
t.is(vm.foo, 'bah');
```

### vuenit
```js
vm.foo = 'bah';
t.is(vm.foo, 'bah');
```

## set props
### avoriaz
```js
const vm = avoriaz.mount(c, {
  propsData : {
    foo : 'bah'
  }
});
```

### vue-test
???

### vue-unit
```js
const vm = vueUnit.mount(c, {
  props : {
    foo : 'bah'
  }
});
```

### vuenit
```js
const vm = vuenit.component(c, {
  props : {
    foo : 'bah'
  }
});
```

## access props
### avoriaz
```js
t.is(vm.propsData().foo, 'foo');
```

### vue-test
???

### vue-unit
```js
t.is(vm.foo, 'foo');
```

### vuenit
```js
t.is(vm.foo, 'foo');
```

## update props
### avoriaz
???

### vue-test
???

### vue-unit
???

### vuenit
```js
vm.propsData.foo = 'bah';
await vm.$nextTick();
t.is(vm.foo, 'bah');
```

## slots
### avoriaz
???

### vue-test
???

### vue-unit
```js
const vm = vueUnit.component(c, {
  slots : {
    header : '<h1>Header</h1>'
    default : '<div>Body</div>',
    footer : '<h4>Footer</h4>'
  }
});
```

### vuenit
```js
const vm = vuenit.component(c, {
  slots : {
    header : '<h1>Header</h1>'
    default : '<div>Body</div>',
    footer : '<h4>Footer</h4>'
  }
});
```

## component name
### avoriaz
```js
t.is(vm.name(), 'Foo');
```

### vue-test
???

### vue-unit
```js
t.is(vm.$options.name, 'Foo');
```

### vuenit
```js
t.is(vm.$name, 'Foo');
```

## emit events
### avoriaz
```js
vm.simulate('click'); // cannot attach a payload...
```

### vue-test
```js
vm.trigger('click');
```

### vue-unit
```js
vm.$emit('click', {});
```

### vuenit
```js
vm.$emit('click', {});
```

## emit dom events
### avoriaz
```js
vm.find('button')[0].simulate('click');
```

### vue-test
```js
vm.trigger('click');
```

### vue-unit
```js
vm.$el.querySelector('button').dispatchEvent(new Event('click'));
```

### vuenit
```js
vm.$el.querySelector('button').dispatchEvent(new Event('click'));
```

## listen to events
### avoriaz
 ???

### vue-test
???

### vue-unit
```js
vm.$on('customEvent', spy);
```

### vuenit
```js
vm.$on('customEvent', spy);
// or
vuenit.component(c, {
  on : {
    customEvent : spy
  }
});
```

## find child component
### avoriaz
```js
vm.find(MyComponent);
```

### vue-test
???

### vue-unit
???

### vuenit
```js
vm.$find(MyComponent);
vm.$findOne('myComponent');
```

## find dom element
### avoriaz
```js
vm.find('.myClass');
```

### vue-test
```js
vm.find('.myClass');
```

### vue-unit
```js
vm.$el.querySelector('.myClass');
```

### vuenit
```js
vm.$find('.myClass');
vm.$findOne('.myClass');
```

## contains component
### avoriaz
```js
t.true(vm.contains(Component));
```

### vue-test
???

### vue-unit
???

### vuenit
t.true(vm.$contains(Component));

## contains dom element
### avoriaz
```js
t.true(vm.contains('.myClass'));
```

### vue-test
```js
t.true(vm.contains('.myClass'));
```

### vue-unit
```js
t.truthy(vm.$el.querySelector('.myClass'));
```

### vuenit
```js
t.true(vm.$contains('myClass'));
```

## check component attribute
### avoriaz
```js
t.true(vm.hasAttribute('id', 'foo'));
```

### vue-test
???

### vue-unit
```js
t.is(vm.$el.getAttribute('id'), 'foo');
```

### vuenit
```js
t.is(vm.$el.getAttribute('id'), 'foo');
```

## check dom attribute
### avoriaz
```js
t.true(vm.find('.myClass')[0].hasAttribute('id', 'foo'));
```

### vue-test
```js
t.true(vm.find('.myClass')[0].getAttribute('id'), 'foo');
```

### vue-unit
```js
t.is(vm.$el.querySelector('.myClass').getAttribute('id'), 'foo');
```

### vuenit
```js
t.is(vm.$el.querySelector('.myClass').getAttribute('id'), 'foo');
```

## check component class
### avoriaz
```js
t.true(vm.hasClass('myClass'));
```

### vue-test
```js
t.true(vm.hasClass('myClass'));
```

### vue-unit
```js
t.true(vm.$el.classList.contains('myClass'));
```

### vuenit
```js
t.true(vm.$el.classList.contains('myClass'));
```

## check dom class
### avoriaz
```js
t.true(vm.find('.myClass')[0].hasClass('myClass')); // possibly a redundant test!
```

### vue-test
???

### vue-unit
```js
t.true(vm.$el.querySelector('.myClass').classList.contains('myClass'));
```

### vuenit
```js
t.true(vm.$el.querySelector('.myClass').classList.contains('myClass'));
```

## check component style
### avoriaz
```js
t.true(vm.hasStyle('width', '100%'));
```

### vue-test
???

### vue-unit
```js
t.is(vm.$el.style.width, '100%');
```

### vuenit
```js
t.is(vm.$el.style.width, '100%');
```

## check dom style
### avoriaz
```js
t.true(vm.find('.myClass').hasStyle('width', '100%'));
```

### vue-test
???

### vue-unit
```js
t.is(vm.$el.querySelector('.myClass').style.width, '100%');
```

### vuenit
```js
t.is(vm.$el.querySelector('.myClass').style.width, '100%');
```

## check html
### avoriaz
```js
t.is(vm.html(), '<div/>');
```

### vue-test
```js
t.is(vm.html(), '<div/>');
```

### vue-unit
```js
t.is(vm.$el.outerHTML, '<div/>');
```

### vuenit
```js
t.is(vm.$el.outerHTML, '<div/>');
```

## check component matches selector
### avoriaz
```js
t.true(vm.is('div'));
```

### vue-test
```js
t.true(vm.matches('div'));
```

### vue-unit
```js
t.is(vm.$el.tagName, 'DIV');
```

### vuenit
```js
t.is(vm.$el.tagName, 'DIV');
```


## check component is empty
### avoriaz
```js
t.true(vm.isEmpty());
```

### vue-test
```js
t.true(vm.isEmpty());
```

### vue-unit
```js
t.is(vm.$el.children.length, 0);
```

### vuenit
```js
t.is(vm.$el.children.length, 0);
```

## inject dependencies
### avoriaz
???

### vue-test
???

### vue-unit
???

### vuenit
```js
const vm = vuenit.component(c, {
  inject : { $store, $route, service }
});
```

## mock vuex store
### avoriaz
```js
avoriaz.use(vuex);
const store = new vuex.Store({
  modules : {
    user : {
      state : {},
      actions : {
        actionFoo : spy
      }
    }
  }
});
const vm = avoriaz.mount(c, {store});
```

### vue-test
???

### vue-unit
```js

```

### vuenit
```js
const vm = vuenit.component(c, {
  store : {
    user : {
      actions : {
        actionFoo : spy
      }
    }
  }
});
```

## mock components
### avoriaz
???

### vue-test
???

### vuenit
```js
var vm = vuenit.component(c, {
  components : {
    myComponent : '<span>mock content</span>'
  }
});
```

## shallow render
### avoriaz
???

### vue-test
???

### vuenit
```js
var vm = vuenit.component(c, {
  stubComponents : true
});
```
