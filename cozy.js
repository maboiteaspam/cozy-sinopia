'use strict';

var npm = require('npm');
var pathExtra = require('path-extra');
var express = require('express');
var http = require('http');
var spawn = require('child_process').spawn;
var bodyParser = require('body-parser');

var npmOptions = {
  userconfig: pathExtra.join(pathExtra.homedir(), '.npmrc'),
  silent: true
};

var cozyHandler = {
  originalRegistry: null,
  sinopia: null,
  start: function(options, done) {

    npm.load(npmOptions, function () {
      cozyHandler.originalRegistry = npm.config.get('registry');

      var showLog = !!options.showLog;
      var hostname = options.hostname || '127.0.0.1';

      var sinopiaPort = options.getPort();
      var sinopiaAddr = 'http://' + hostname + ':' + sinopiaPort + '/';

      var app = express();

      var getStatus = function(){
        var registry = npm.config.get('registry');
        return {
          enabled: (registry === sinopiaAddr),
          isRunning: cozyHandler.sinopia!==null,
          originalRegistry: cozyHandler.originalRegistry,
          sinopiaRegisrty:sinopiaAddr
        };
      };

      //npm set registry http://localhost:4873/
      app.use(express.static(pathExtra.join(__dirname, '/public') ) );
      app.use(bodyParser.urlencoded({ extended: false }));
      app.get('/status', function(req, res){
        res.send(getStatus());
      });
      app.post('/original_registry', function(req, res){
        cozyHandler.originalRegistry = req.body.registry;
        res.send(getStatus());
      });
      app.get('/enable', function(req, res){
        npm.commands.config(['set', 'registry', sinopiaAddr], function(){
          res.send(getStatus());
        });
      });
      app.get('/disable', function(req, res){
        npm.commands.config(['set', 'registry', cozyHandler.originalRegistry],
          function(){
            res.send(getStatus());
          });
      });

      var server = http.createServer(app);
      server.listen(options.port, hostname);

      npm.commands.config(['set', 'registry', sinopiaAddr], function(){

        var sinopiaBin = pathExtra.join(
          __dirname, 'node_modules', '.bin', 'sinopia');

        cozyHandler.sinopia = spawn(sinopiaBin,
          ['-l', hostname + ':' + sinopiaPort ],
          { stdio: showLog ? 'inherit' : 'ignore' });

        cozyHandler.sinopia.once('close', function(){
            npm.commands.config(['set', 'registry', cozyHandler.originalRegistry]);
            cozyHandler.sinopia  = null;
        });

        done(null, app, server);
      });
    });

  },
  stop: function(done) {
    if (cozyHandler.sinopia !== null) {
      cozyHandler.sinopia.kill();
    }
    var invl = setInterval(function(){
      if ( cozyHandler.sinopia === null ) {
        clearInterval(invl);
        done();
      }
    }, 50);
  }
};

module.exports = cozyHandler;
