var cozyHandler = require('./cozy');

console.log('sinopia made cozy..');
var options = {
  showLog: true,
  port: 8080,
  getPort: function(){
    return 8081;
  }
};
cozyHandler.start(options, function(err,app,server){
  console.log('http://localhost:8080/');
  console.log('ready!');


  var done = function(){
    process.exit();
  };

  process.on('uncaughtException', function(err){
    if (err) {
      console.error(err);
    }
    cozyHandler.server.close();
    cozyHandler.stop(done);
  });

  process.on('SIGINT', function(){
    cozyHandler.server.close();
    cozyHandler.stop(done);
  });
});
