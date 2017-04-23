var log = require('./log');
var Update = require('./update');
var World = require('./world');
var Components = require('./components');
var ActionController = require('../server/controller/action');

var NatureBot = function(socket, config) {
   this.running = false;
   this.socket  = socket;
   this.world   = new World();
   this.ticks   = 0;

   this.components = config.components.map((info) => {
      var name = info.name || info;

      if (!Components[name]) {
         log.error('Component ' + name + ' not found in the components/ directory');
      }

      return new Components[name](info);
   });
};

NatureBot.prototype.start = function() {
   if (this.running) {
      log.error('NatureBot is already running');
      return false;
   }

   log.info('NatureBot started');
   var self = this;
   this.world.fetch().then(() => {
      self.running = true;
      self.tick();
   });
};

NatureBot.prototype.tick = function() {
   if (!this.running) {
      return;
   }

   var world  = this.world;
   var socket = this.socket;
   Promise.all(this.components.map((component) => component.tick(world))).then((updates) => {
      return updates.map((update) => {
         if (update instanceof Update) {
            return [update];
         }
         else {
            return update;
         }
      });
   }).then((updatesAsArrays) => {
      return [].concat.apply([], updatesAsArrays);
   }).then((updates) => {
      if (updates.length === 0) {
         log.verbose('No updates for server');
         return;
      }

      log.verbose('Sending updates to server: ' + updates);
      socket.emit('updates', updates.map((update) => update.serialize()));

      var update_id = this.ticks++;
      socket.once('update_' + update_id, function(result, message) {
         if (result === 'fail') {
            log.error('Error on update[' + update_id + ']: ' + message)
         }
      });
   }).catch((e) => {
      log.error('Tick error: ' + e.message);
   });

   setTimeout(this.tick.bind(this), 250);
};

NatureBot.prototype.stop = function() {
   this.running = false;
};

NatureBot.prototype.update = function(updates) {
   this.world.update(updates);
};

module.exports = NatureBot;