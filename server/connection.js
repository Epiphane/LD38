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
      socket.on('remake', this.remake.bind(this));
   };

   Connection.prototype.logout = function() {

   };

   Connection.prototype.disconnect = function() {
   };

   Connection.prototype.recv = function(message) {
      this.game.message(this, message);
   };

   Connection.prototype.activate = function(index, action) {
      var socket = this.socket;
      WorldController.activate(index, action).then((value) => {
         io.emit('update', [index, value]);
      })
   };

   Connection.prototype.remake = function() {
      WorldController.remake().then(() => io.emit('remake'));
   };

   Connection.prototype.handle = function(message) {
      this.handler.apply(this, arguments);
   };

   return Connection;
};
