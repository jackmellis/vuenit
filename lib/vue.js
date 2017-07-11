var vue = require('vue');
var augment = require('./component/augment').augment;

module.exports = vue && vue.default || vue;

augment(module.exports.prototype);
