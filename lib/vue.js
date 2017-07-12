var Vue = require('vue');
var vue = Vue && Vue.default || Vue;

module.exports = vue;

var augment = require('./component/augment');
augment(vue.prototype);
