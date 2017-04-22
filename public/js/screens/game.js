define([], function() {
   return Juicy.State.extend({
      constructor: function(connection) {
         this.connection = connection;

         this.world = null;
         this.lastDrag = null;

         var self = this;
         connection.on('connect', this.fetch.bind(this));
         connection.on('remake', this.fetch.bind(this));

         connection.on('update', function(info) {
            var index = info[0];
            var value = info[1];

            self.world.tiles[index] = value;
            self.updated = true;
         });

         this.cooldown = 0.2;
         this.timer = 0;
      },

      init: function() {

      },

      fetch: function() {
         var self = this;
         $.get('/api/world').then(function(response) {
            self.world = response;
            self.updated = true;
         });
      },

      key_SPACE: function() {
         this.connection.emit('remake');
      },

      update: function(dt, game) {
         if (!this.world)
            return;

         // if (this.timer <= 0) {
            // this.activate(new Juicy.Point(Math.random() * 400, Math.random() * 400));
            // this.timer = this.cooldown;
         // }
         // this.timer -= dt;

         return true; // Don't rerender
      },

      activate: function(point) {
         if (!this.world)
            return;

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
               context.fillStyle = colors[this.world.tiles[i + j * this.world.width] % 8];
               context.fillRect(i * tilesize, j * tilesize, tilesize, tilesize);
            }
         }
      }
   })
})