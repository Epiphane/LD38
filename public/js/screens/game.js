define([
   'helpers/terrain'
], function(
   TerrainHelper
) {
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

         if (!TerrainHelper.ready()) {
            TerrainHelper.onReady(function() {
               self.updated = true;
            });
         }

         this.camera = new Juicy.Point();

         this.canvas = document.createElement('canvas');
         this.context = this.canvas.getContext('2d');
      },

      init: function() {

      },

      updateMap: function(index) {
         // TODO maybe later i guess
         // if (!index) {
         //    // Update the whole map
         //    this.canvas.width = this.world.width * TerrainHelper.tilesize;
         //    this.canvas.height = this.world.height * TerrainHelper.tilesize;
         //    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

         //    for (var i = 0; i < this.canvas.width * this.canvas.height; i ++) {

         //    }
         // }
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

         var speed = 55;
         if (game.keyDown('LEFT')) {
            this.camera.x -= speed * dt;
            this.updated = true;
         }
         if (game.keyDown('RIGHT')) {
            this.camera.x += speed * dt;
            this.updated = true;
         }
         if (game.keyDown('UP')) {
            this.camera.y -= speed * dt;
            this.updated = true;
         }
         if (game.keyDown('DOWN')) {
            this.camera.y += speed * dt;
            this.updated = true;
         }

         return true; // Don't rerender
      },

      activate: function(point) {
         if (!this.world)
            return;

         point.x = Math.floor(point.x / TerrainHelper.tilesize + this.camera.x);
         point.y = Math.floor(point.y / TerrainHelper.tilesize + this.camera.y);

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
         if (!this.world || !TerrainHelper.ready) {
            return;
         }

         if (this.camera.x < 0)
            this.camera.x = 0;
         if (this.camera.y < 0)
            this.camera.y = 0;
         if (this.camera.x + width / TerrainHelper.tilesize > this.world.width)
            this.camera.x = this.world.width - width / TerrainHelper.tilesize;
         if (this.camera.y + height / TerrainHelper.tilesize > this.world.height)
            this.camera.y = this.world.height - height / TerrainHelper.tilesize;

         var min_x = Math.floor(this.camera.x);
         var min_y = Math.floor(this.camera.y);

         for (var i = min_x; (i - min_x) * TerrainHelper.tilesize < width; i ++) {
            for (var j = min_y; (j - min_y) * TerrainHelper.tilesize < height; j ++) {
               TerrainHelper.draw(context, 
                                  i - this.camera.x, 
                                  j - this.camera.y, 
                                  this.world, 
                                  i, 
                                  j);
            }
         }
      }
   })
})