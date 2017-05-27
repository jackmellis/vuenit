import test from 'ava';
import alias from 'module-alias';
// const hooks = require('require-extension-hooks');
import hooks from 'require-extension-hooks';

alias.addAlias('vue', 'vue/dist/vue.esm.js');
debugger;
hooks('js').push(({filename, content}) => {
  if (filename.indexOf('vue.esm.js') < 0){
    return;
  }
  return content.replace(/export default/, 'exports.default=');
});

test.failing('is able to use esm build of Vue without configuratoin', t => {
  var vuenit = require('../../lib');
});
