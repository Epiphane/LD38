define([
], function(
) {
   var noop = function() {};

   var events = [
      'connect', 'disconnect', 'reconnect', 'update'
   ];

   var ConnectionManager = function() {
      this.socket = new io();

      this.callbacks = {};

      this.setupSocketHooks();
   };

   ConnectionManager.prototype.emit = function(type, data) {
      this.socket.emit(type, data);
   };

   ConnectionManager.prototype.send = function(message) {
      this.emit('message', message);
   };

   ConnectionManager.prototype.on = function(event, callback) {
      this.callbacks[event] = callback;
   };

   ConnectionManager.prototype.off = function(event, callback) {
      this.callbacks[event] = noop;
   };

   ConnectionManager.prototype.onOnce = function(event, callback) {
      var self = this;
      
      this.callbacks[event] = function() {
         self.off(event);

         callback.apply(self, arguments);
      }
   };

   ConnectionManager.prototype.setupSocketHooks = function() {
      var self = this;

      events.forEach(function(event) {
         self.callbacks[event] = noop;

         self.socket.on(event, function(data) {
            self.callbacks[event](data);
         });
      });
   }

   return ConnectionManager;
});