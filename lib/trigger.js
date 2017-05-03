module.exports = function (target, evt, args) {
  if (!target){
    throw new Error('Cannot trigger event as no target provided');
  }
  [].concat(target).forEach(function (target) {
    if (target.$emit){
      target = target.$el;
    }
    if (!target.dispatchEvent){
      throw new Error('Not a valid target object: ' + JSON.stringify(target));
    }

    if (!(evt instanceof Event)){
      evt = new Event(evt);
    }

    if (args){
      Object.keys(args).forEach(function (key) {
        evt[key] = args[key];
      });
    }

    target.dispatchEvent(evt);
  });
};
