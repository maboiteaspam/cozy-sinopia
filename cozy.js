'use strict';

var npm = require('npm');
var pathExtra = require('path-extra');
var express = require('express');
var http = require('http');
var spawn = require('child_process').spawn;

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

      var sinopiaBin = pathExtra.join(
        __dirname, 'node_modules', '.bin', 'sinopia');
      cozyHandler.sinopia = spawn(sinopiaBin,
        ['-l', hostname + ':' + sinopiaPort ],
        { stdio: showLog ? 'inherit' : 'ignore' });

      var app = express();

      //npm set registry http://localhost:4873/
      app.use(express.static(pathExtra.join(__dirname, '/public') ) );
      app.get('/status', function(req, res){
        var registry = npm.config.get('registry');
        res.send({enabled: (registry === sinopiaAddr) });
      });
      app.get('/enable', function(req, res){
        npm.commands.config(['set', 'registry', sinopiaAddr], function(){
          res.send({enabled: true });
        });
      });
      app.get('/disable', function(req, res){
        npm.commands.config(['set', 'registry', cozyHandler.originalRegistry],
          function(){
            res.send({enabled: false });
          });
      });

      var server = http.createServer(app);
      server.listen(options.port, hostname);

      npm.commands.config(['set', 'registry', sinopiaAddr], function(){
        done(null, app, server);
      });
    });

  },
  stop: function(done) {
    cozyHandler.sinopia.once('close', function(){
      cozyHandler.sinopia = null;
    });
    cozyHandler.sinopia.kill();
    npm.load(npmOptions, function () {
      npm.commands.config(['set', 'registry', cozyHandler.originalRegistry],
        function(){
          done();
        });
    });
  }
};

module.exports = cozyHandler;
