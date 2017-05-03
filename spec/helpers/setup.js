const browser = require('browser-env');
const alias = require('module-alias');

browser();
alias.addAlias('vue', 'vue/dist/vue');
