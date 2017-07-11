# Changelog

## 1.0.0
- `vm.$find` now returns an array-like object that exposes the first matched item's object. So you can now do `vm.$find('router-link').$html` as well as `vm.$find('router-link')[0].$html`. It still have array-like methods i.e. `vm.$find('router-link').concat([])` and be turned into a *true* array with `vm.$find('router-link').slice()`.[65](https://github.com/jackmellis/vuenit/issues/65)
- Added `vuenit.build` method, allowing you to create a custom, reusable mount method. [68](https://github.com/jackmellis/vuenit/issues/68)
- Removed `vm.$create` as this has been superseded by the above `vuenit.build` method. [67](https://github.com/jackmellis/vuenit/issues/67)
- When calling `vm.$find` to return html elements (i.e. `vm.$find('button')` or `vm.$findOne('.thingy')`) the element will be augmented with `$html`, `$name`, `$find`, `$contains` etc. [71](https://github.com/jackmellis/vuenit/issues/71)
- Added `vm.$text` and `foundElement.$text` properties that return the elements text content.
- If a component template contained no dynamic rendering (just regular html elements with no mustaches, props, etc.) it would fail to render as vuenit was not attaching the static render functions. [73](https://github.com/jackmellis/vuenit/issues/73)


### Breaking Changes
- As `vm.$find` no longer returns a *true* array, certain operations will no longer work, e.g. `[].concat(vm.$find('...'), vm.$find('...'))` will not concat the results of 2 finds anymore as they are not arrays, you would need to call `.slice()` on them first. `Array.isArray` will also start returning false.
- Any calls to `vm.$create` will throw a deprecation error. In future releases it will be removed entirely.

## 0.6.0
- Added a `Vue` and `injector` option [58](https://github.com/jackmellis/vuenit/issues/58)
- Added a `data` option to specify initial data properties [55](https://github.com/jackmellis/vuenit/issues/55)
- Made `component.name` or `options.name` optional, it will just default to a randomly-generated test name [62](https://github.com/jackmellis/vuenit/issues/62)
- Added `vm.$trigger` method [64](https://github.com/jackmellis/vuenit/issues/64)

## 0.5.0
- `vuenit.http` now uses the `mock-http-client` library.
- `vuenit.store` now uses the `mock-vuex` library.
- `vuenit.router` now uses the `mock-vue-router` library.
- Added a `directives` option so you can stub specific directives.

## 0.4.2
- Setting `vuenit.component.config.install` did not work as the install method was being activated before the options had been merged.
- mock router was using `[].find` method which is not supported in older browsers. Replaced with old reliable for loops.
- `vuenit.component.config` is now set by default, meaning you can just write `vuenit.component.config.property=value`.

## 0.4.1
- Fixed a bug when using `vue/dist/vue.esm.js` (Vue's main entry point) as Vuenit doesn't expect esm syntax.

## 0.4.0
- Previously, if prop values were not passed into `options.props`, setting `vm.propsData.unsetprop` would not update the component. This has now been fixed.
- Improved `$store.when` to accept method types (i.e. *commit/dispatch*) as well as adding `$store.otherwise` method. Also accepts regular expressions to match against: e.g. `$store.when('commit', /MYCOMMIT/).return('value')`.
- `vuenit.router()` creates a mock version of `$route` and `$router`.
- Can automatically inject $route and $router into a component with the router option: `{ router : true }`  
- `stubDirectives` option lets you automatically stub all directives used by a component
- If a component instance already has properties for `$name`, `$html`, `$find`, etc., they will not be overwritten with vuenit's properties.
- `shallow` option can be passed in, which is an alias for setting stubComponents, stubFilters, and stubDirectives to true.
- Components can also be shallow rendered by calling the new `vuenit.shallow()` method.
- The `before` option allows you to intercept the component and options just before the component is instantiated, allowing you to spy on component methods or mock computed values, etc.

## 0.3.1
- Fixed issues with `stubComponents` option getting transposed by Vue for global components.
- `stubComponents` default template now has a `<slot>` so it still renders inner html.

## 0.3.0
- Access component instance's name with `vm.$name` (rather than `vm.$options.name`)  
- Access component's html content with `vm.$html` (rather than `vm.$el.outerHTML`)
- `vm.$find` allows you to search a component's html for matching elements or component instances.
- `vm.$contains` tests whether a component contains another component or a html element.
- `slots` option lets you easily insert slot content into a component. This is the equivalent of manually inserting slots with the `innerHTML` property.
- `on` option lets you add event listeners when creating a component.
- `stubFilters` flag automatically stubs all *known* filters.
- `filters` option allows you to stub/mock filters
- `vuenit.trigger` method allows you trigger dom events.
- `vm.$create` method creates a new instance of a component using the same options as before

## 0.2.0
- `stubComponents` flag automatically stubs all *known* components  
- `components` options allows you to stub/mock components  
- added `install` method  
- disabled unknownElement debug message  
- disabled productionTip debug message  
- added a `cleanUp` method that removes any globally-registered components from the Base Vue object  
- `vuenit.component.config` and `vuenit.directive.config` allow global settings to be applied.  
