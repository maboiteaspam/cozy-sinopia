var cozyStub = require('cozy-stub');

var cozyHandler = require('./cozy');

console.log('sinopia made cozy..');
var options = {
  showLog: true,
  port: 8090
};

cozyStub.stub(cozyHandler, options);
