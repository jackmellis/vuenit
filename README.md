# vuenit
Vue Unit Test Helpers

[![npm version](https://badge.fury.io/js/vuenit.svg)](https://badge.fury.io/js/vuenit)
[![Build Status](https://travis-ci.org/jackmellis/vuenit.svg?branch=master)](https://travis-ci.org/jackmellis/vuenit)
[![Code Climate](https://codeclimate.com/github/jackmellis/vuenit/badges/gpa.svg)](https://codeclimate.com/github/jackmellis/vuenit)
[![Test Coverage](https://codeclimate.com/github/jackmellis/vuenit/badges/coverage.svg)](https://codeclimate.com/github/jackmellis/vuenit/coverage)

Vuenit is a testing utility that offers a number of useful methods to make testing Vue applications easier:
- Easily mount Vue components  
- Test directives  
- Search the DOM for component instances  
- Inject dependencies into components  
- Test slots  
- Update *data* and *props* on the fly  
- Shallow rendering  
- Mocked versions of __Vuex__, __Vue-Router__, and a __$http__ module to make testing with dependencies easier  

```
npm install vuenit --save-dev
```

```js
import {mount, mockRouter, mockHttp, mockStore} from 'vuenit';
import c from 'path/to/component';

const {$router} = mockRouter();
const $http = mockHttp();
const $store = mockStore();

const options = {
  inject : { $router, $http, $store },
  props : { userId : 'x4' },
  stubComponents : true
};

const vm = mount(c, options);
```

__Vuenit__ has a huge array of configuration options for different testing scenarios. For full documentation, see [https://jackmellis.gitbooks.io/vuenit/content](https://jackmellis.gitbooks.io/vuenit/content)
