'use strict';

var npm = require('npm');
var pathExtra = require('path-extra');
var express = require('express');
var http = require('http');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var cozyHandler = {
  server: null,
  sinopia: null,
  start: function(options, done) {

    var npmOptions = {
      userconfig: pathExtra.join(pathExtra.homedir(), '.npmrc'),
      silent: true
    };
    npm.load(npmOptions, function () {

      var originalRegistry = 'https://registry.npmjs.org/';
      var hostname = options.hostname || '127.0.0.1';

      var sinopiaPort = options.getPort();
      var sinopiaAddr = 'http://' + hostname + ':' + sinopiaPort + '/';

      cozyHandler.sinopia = spawn('sinopia', ['-l', hostname + ':' + sinopiaPort ]);
      cozyHandler.sinopia.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
      });

      cozyHandler.sinopia.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
      });
      cozyHandler.sinopia.stdin.end();

      var app = express();

      //npm set registry http://localhost:4873/
      app.use(express.static( pathExtra.join(__dirname, '/public') ) );
      app.get('/status', function(req, res){
        var registry = npm.config.get('registry');
        res.send({enabled: (registry == sinopiaAddr) });
      });
      app.get('/enable', function(req, res){
        npm.commands.config(['set','registry', sinopiaAddr], function(){
          res.send({enabled: true });
        });
      });
      app.get('/disable', function(req, res){
        npm.commands.config(['set','registry', originalRegistry], function(){
          res.send({enabled: false });
        });
      });

      cozyHandler.server = http.createServer(app);
      cozyHandler.server.listen( options.port, hostname );

      done(null, app, cozyHandler.server);
    });

  },
  stop: function(done) {
    cozyHandler.sinopia.once('close', function(){
      cozyHandler.server.close();
      cozyHandler.sinopia  = null;
      done();
    });
    cozyHandler.sinopia.kill();
  }
};

module.exports = cozyHandler;
