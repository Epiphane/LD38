var express = require('express');
var app     = new express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var fs      = require('fs');

var sqldb   = require('./sqldb');
var api     = require('./api');
var Connection = require('./connection')(io, sqldb);
var less = require('less-middleware');

var TILES = require('./tiles');

// API
app.use('/api', api);

// Admin pages
app.use(less('public'));
app.use('/lib', express.static(__dirname + '/../node_modules/'));

// Game
app.use('/js/constants/tiles.js', function(req, res) {
   res.end('define([], function() { return ' + JSON.stringify(TILES) + '; })');
})
app.use('/', express.static(__dirname + '/../public/'));

http.listen(process.env.PORT || 3000, function(){
   console.log('listening on port ' + (process.env.PORT || 3000));
});

// Deal with the socket connection to clients
io.on('connection', function(socket) {
   var conn = new Connection(socket);
});