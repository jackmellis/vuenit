var Vue = require('./vue');

module.exports = function (obj) {
  var reactive = new Vue({
    data : { data : obj }
  });

  return reactive.data;
};
