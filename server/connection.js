var _               = require('lodash');
var WorldController = require('./controller/world');
var ActionController= require('./controller/action');
var Inventory       = require('./controller/inventory');

module.exports = function(io, db) {
   var connections = {};

   var Connection = function(socket) {
      this.socket = socket;
      this.name = null;
      this.game = null;
      this.inventory = new Inventory();

      socket.on('message', this.recv.bind(this));
      socket.on('action', this.action.bind(this));
      socket.on('remake', this.remake.bind(this));
      socket.on('player_pos', this.positionChanged.bind(this));
   };

   Connection.prototype.logout = function() {

   };

   Connection.prototype.disconnect = function() {
   };

   Connection.prototype.recv = function(message) {
      this.game.message(this, message);
   };

   Connection.prototype.positionChanged = function(newPosition) {
      this.socket.broadcast.emit('player_pos_update', newPosition)
   };

   Connection.prototype.action = function(index, action, _id) {
      var socket = this.socket;
      var inventory = this.inventory;

      WorldController.getWorld().then((world) => {
         return ActionController.action(world, index, action, inventory);
      }).then((result) => {
         if (!result.executed) {
            console.log(result, _id);
            if (_id) socket.emit('action_' + _id, 'fail');
         }
         else {
            if (_id) socket.emit('action_' + _id, 'success');
            socket.broadcast.emit('udpates', result.updates);
         }
      });
   };

   Connection.prototype.remake = function() {
      WorldController.remake().then(() => io.emit('remake'));
   };

   Connection.prototype.handle = function(message) {
      this.handler.apply(this, arguments);
   };

   return Connection;
};
