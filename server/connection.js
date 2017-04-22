var _       = require('lodash');

module.exports = function(io) {
   var connections = {};

   var Connection = function(socket) {
      this.socket = socket;
      this.name = null;
      this.game = null;

      socket.on('message', this.recv.bind(this));
   };

   Connection.prototype.logout = function() {

   };

   Connection.prototype.disconnect = function() {
      if (this.name) {
         this.game.releasePlayer(this);
      }
   };

   Connection.prototype.recv = function(message) {
      this.game.message(this, message);
   };

   Connection.prototype.handle = function(message) {
      this.handler.apply(this, arguments);
   };

   return Connection;
};