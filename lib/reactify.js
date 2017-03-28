module.exports = function (obj) {
  const Vue = require('vue');
  const reactive = new Vue({
    data : { data : obj }
  });

  return reactive.data;
};
