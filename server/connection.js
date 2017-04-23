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
      this.elevated = false;
      this.inventory = new Inventory();

      socket.on('updates', this.update.bind(this));
      socket.on('elevate', this.elevate.bind(this));
      socket.on('action', this.action.bind(this));
      socket.on('remake', this.remake.bind(this));
      socket.on('player_pos', this.positionChanged.bind(this));
   };

   Connection.prototype.logout = function() {

   };

   Connection.prototype.disconnect = function() {
   };

   Connection.prototype.update = function(updates, _id) {
      if (!this.elevated) {
         return;
      }

      var socket = this.socket;
      WorldController.update(updates).then((updates) => {
         // TODO error handling...?
         socket.broadcast.emit('updates', updates);
         socket.emit('update_' + _id, 'success');
      }).catch((e) => {
         console.error('Error performing update: ' + e.message);
         socket.emit('update_' + _id, 'fail', e.message);
      })
   };

   Connection.prototype.elevate = function(message) {
      if (message === process.env.ELEVATED_SECRET) {
         this.elevated = true;
      }
      else {
         console.log('Rejecting secret ' + message);
      }
      this.socket.emit('elevated', this.elevated);
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
            if (_id) socket.emit('action_' + _id, 'fail');
         }
         else {
            if (_id) socket.emit('action_' + _id, 'success');
            socket.broadcast.emit('updates', result.updates);
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
