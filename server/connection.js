var _               = require('lodash');
var WorldController = require('./controller/world');

module.exports = function(io, db) {
   var connections = {};

   var Connection = function(socket) {
      this.socket = socket;
      this.name = null;
      this.game = null;

      socket.on('message', this.recv.bind(this));
      socket.on('activate', this.activate.bind(this));
   };

   Connection.prototype.logout = function() {

   };

   Connection.prototype.disconnect = function() {
   };

   Connection.prototype.recv = function(message) {
      this.game.message(this, message);
   };

   Connection.prototype.activate = function(index) {
      var socket = this.socket;
      WorldController.activate(index).then((value) => {
         socket.broadcast.emit('update', [index, value]);
      })
   };

   Connection.prototype.handle = function(message) {
      this.handler.apply(this, arguments);
   };

   return Connection;
};