var cozyHandler = require('./cozy');

console.log('sinopia made cozy..');
var options = {
  port: 8080,
  getPort: function(){
    return 8081;
  }
};
cozyHandler.start(options, function(){
  console.log('ready!');
});


var done = function(){
  process.exit();
};

process.on('uncaughtException', function(err){
  if (err) {
    console.error(err);
  }
  cozyHandler.stop(done);
});

process.on('SIGINT', function(){
  cozyHandler.stop(done);
});
