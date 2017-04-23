var http      = require('http');
var io        = require('socket.io');
var ioClient  = require('socket.io-client');
var config    = require('../server/config/environment')
var log       = require('./log');
var NatureBot = require('./bot');
var config    = require('./config');

var socket    = ioClient.connect(process.env.DOMAIN);
var bot       = new NatureBot(socket, config);

socket.on('connect', function() {
   log.info('Connected to server');
   socket.emit('elevate', process.env.ELEVATED_SECRET);
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
   }
});

socket.on('updates', function(updates) {
   log.verbose('Received updates: ' + JSON.stringify(updates));
   bot.update(updates);
});
