module.exports = function (obj) {
  const Vue = require(this.vuePath);
  const reactive = new Vue({
    data : { data : obj }
  });

  return reactive.data;
};
