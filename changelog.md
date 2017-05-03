# Changelog

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

## 0.2.0
- `stubComponents` flag automatically stubs all *known* components  
- `components` options allows you to stub/mock components  
- added `install` method  
- disabled unknownElement debug message  
- disabled productionTip debug message  
- added a `cleanUp` method that removes any globally-registered components from the Base Vue object  
- `vuenit.component.config` and `vuenit.directive.config` allow global settings to be applied.  
