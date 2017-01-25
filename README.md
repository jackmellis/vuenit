# vuenit
Vue Unit Test Helpers for server-side testing

## Component  
The component function creates an instance of a specified component. Plugin values such as $router can be injected in before the component is initialised, and props can also be passed in as if they were real values.  
The function takes two parameters: `Component` and `Options`:  
### Component  
This can either be a string (the name of a pre-registered component) or a component definition object.  
### Options  
Options should be an object with the following properties, all of which are optional:  
#### Props  
Specify props that should be passed into the component, these should match up to the props used by your component.  
`{ props : { foo : 'foo', bah : true } }`  
#### Inject  
Values to inject into the component. These will be attached to the component instance. This uses *vue-inject* in the background.  
`{ inject : { $router : {}, someService : {} } }`  
#### Store  
This is an option to set up a fake vuex-style store for the component. This is simply a convenience wrapper that uses the *Store* function (see below) and adds it into the above *inject* option.  
`{ store : { items : [ { id : 1 } ] } }`  
...is the equivalent of...  
`{ inject : { $store : vuenit.store({ items : [ { id : 1 } ] }) } }`  
#### innerHTML  
Set the inner html of the component. This is useful if you want to test a component that has slots in it.  
`{ innerHTML : '<span slot="component-slot>xxx</span>"' }`  
#### Name  
The name of the component. Vuenit requires components to be named. If your component definition does not a have a name property, you can provide one here.  

The props, inject, and store options all become reactive after initialising the component, meaning that you can update their values directly and the component instance will update as expected.  
```javascript
var vm = vuenit.component(myComponent, options);
vm.computedFromFoo // 'foo'
options.foo = 'bah';
vm.computedFromFoo // 'bah'
```
However, keep in mind that while injected and store properties will be updated immediately, props must be passed through vue's virtual DOM first so the component instance will not be updated until the next tick.


## Directive  
The directive function allows you to test out directives. In the background it creates a dummy component (a div element by default) with the directive applied as an attribute. The component instance is then returned so you can test the effects of the directive on the component (and its html content).  
The function takes two parameters: `Directive` and `Options`:  
### Directive  
This can either be a string, for a globally defined directive. Otherwise it should be an object containing `name : definition object`.  
It is possible to supply more than one directive and you can mix definition objects and globally defined directives. You can even include build-in directives like v-if.  
Note that the directive name should *not* include the `v-` prefix.  
```javascript
vuenit.directive('global-directive');

vuenit.directive({
  'local-directive' : function(el, binding){}
});

vuenit.directive({
  'global-directive' : null,
  'local-directive' : function(el, binding){},
  'if' : null
});
```
### Options  
Options should be an object with the following properties, all of which are optional:  
#### Expression  
The expression to pass into the directive.  
`vuenit.directive('test', { expression : '1===1' });`  
would output  
`v-test="1===1"`  
You can use this in conjunction with *props* to use variables as well.  
`var vm = vuenit.directive('test', { expression : 'x===y', props : { x : 1, y : 1 } });`  
This would allow you to then update the props and re-test the expression.  
```javascript
props.y = 2;
vm.$nextTick(() => {
  vm.$el.outerHTML // would reflect any changes made by the directive
});
```
#### Argument  
Passes an argument into the directive:  
`vuenit.directive('test', { argument : 'foo' });`  
would output  
`v-test:foo`  
#### Modifiers  
Passes modifiers to the directive, this can either be an array of a string  
`vuenit.directive('test', { modifiers : ['foo', 'bah'] });`  
would output  
`v-test.foo.bah`  
#### Props  
Props to be passed into the component. This will then be available within the *expression* string.
#### Element  
The element to use for the component the directive will be placed on. By default this is a div.  
#### Template  
It is possible to completely override the component template. Note that the created directive is inserted into the template by adding a `v-template` attribute on the html.  
`vuenit.directive('test', { template : '<input v-directive>' });`  

## Store  

### Options  
#### State  
#### Getters  
