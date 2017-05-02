# Changelog

## 0.3.0
- Access component instance's name with `vm.$name` (rather than `vm.$options.name`)  
- Access component's html content with `vm.$html` (rather than `vm.$el.outerHTML`)

## 0.2.0
- stubComponents flag automatically stubs all *known* components  
- components options allows you to stub/mock components  
- added install method  
- disabled unknownElement debug message  
- disabled productionTip debug message  
- added a cleanUp method that removes any globally-registered components from the Base Vue object  
- `vuenit.component.config` and `vuenit.directive.config` allow global settings to be applied.  
