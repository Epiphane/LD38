var _               = require('lodash');
var WorldController = require('./controller/world');

module.exports = function(io, db) {
   var connections = {};

   var Connection = function(socket) {
      this.socket = socket;
      this.name = null;
      this.game = null;

      socket.on('message', this.recv.bind(this));
      socket.on('action', this.action.bind(this));
      socket.on('remake', this.remake.bind(this));
   };

   Connection.prototype.logout = function() {

   };

   Connection.prototype.disconnect = function() {
   };

   Connection.prototype.recv = function(message) {
      this.game.message(this, message);
   };

   Connection.prototype.action = function(index, action) {
      var socket = this.socket;
      WorldController.action(index, action).then((updates) => {
         io.emit('updates', updates);
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
