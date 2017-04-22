define([], function() {
   return Juicy.State.extend({
      constructor: function(connection) {
         this.connection = connection;

         this.world = null;
         this.lastDrag = null;

         var self = this;
         connection.on('connect', function() {
            // Ask the server for the entire game state, and also begin polling for changes
            $.get('/api/world').then(function(response) {
               self.world = response;
               self.updated = true;
            });
         });

         connection.on('update', function(info) {
            var index = info[0];
            var value = info[1];

            self.world.tiles[index] = value;
            self.updated = true;
         });
      },

      init: function() {

      },

      update: function(dt, game) {
         if (game.keyDown('SPACE'))
            return false; // RERENDER

         return true; // Don't rerender
      },

      activate: function(point) {
         point.x = Math.floor(point.x / 40);
         point.y = Math.floor(point.y / 40);

         if (this.lastDrag && point.isEqual(this.lastDrag)) {
            return;
         }

         var index = point.x + point.y * this.world.width;
         this.world.tiles[index] = (this.world.tiles[index] + 1) % 8;
         this.updated = true;
         this.lastDrag = point;

         this.connection.emit('activate', index);
      },

      dragstart: function(point) {
         this.activate(point);
      },

      drag: function(point) {
         this.activate(point);
      },

      dragend: function(point) {
         this.lastDrag = null;
      },

      click: function(point) {
         this.activate(point);
         this.lastDrag = null;
      },

      render: function(context, width, height) {
         if (!this.world) {
            return;
         }

         var colors = ['teal', 'green', 'red', 'yellow', 'white', 'pink', 'purple', 'blue'];

         var tilesize = 40;
         for (var i = 0; i < this.world.width; i ++) {
            for (var j = 0; j < this.world.height; j ++) {
               context.fillStyle = colors[this.world.tiles[i + j * this.world.width]];
               context.fillRect(i * tilesize, j * tilesize, tilesize, tilesize);
            }
         }
      }
   })
})