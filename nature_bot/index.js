var http      = require('http');
var io        = require('socket.io');
var ioClient  = require('socket.io-client');
var env       = require('../server/config/environment')
var log       = require('./log');
var NatureBot = require('./bot');
var config    = require('./config');

var domain    = process.env.DOMAIN;
var secret    = process.env.ELEVATED_SECRET;
if (env.env === 'production') {
   secret = process.env.PRODUCTION_SECRET;
   domain = env.production_url;
}

var socket    = ioClient.connect(domain);
var bot       = new NatureBot(socket, config);

socket.on('connect', function() {
   log.info('Connected to server');
   socket.emit('elevate', secret);
});

socket.on('disconnect', function() {
   log.info('Disconnected from server');
   bot.stop();
});

socket.on('elevated', function(result) {
   if (result) {
      log.info('Elevation token accepted');
      bot.start();
   }
   else {
      log.error('Elevation token rejected');
      process.exit(1);
   }
});

socket.on('updates', function(updates) {
   log.verbose('Received updates: ' + JSON.stringify(updates));
   bot.update(updates);
});
