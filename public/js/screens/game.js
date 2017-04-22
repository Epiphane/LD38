define([
   'constants/materials',
   'helpers/terrain',
   'entities/ui',
   'entities/character'
], function(
   MATERIALS,
   TerrainHelper,
   UI,
   Character
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
            self.updateTile(info[0], info[1]);
         });

         this.cooldown = 0.2;
         this.timer = 0;
         this.ticks = 0;

         if (!TerrainHelper.ready()) {
            TerrainHelper.onReady(function() {
               self.updated = true;
            });
         }

         this.camera = new Juicy.Point();

         this.canvas = document.createElement('canvas');
         this.context = this.canvas.getContext('2d');

         this.minimap = document.createElement('canvas');
         this.minimapPixels = null;

         this.ui = new UI(this);
         this.mainChar = new Character(this);
         this.mainChar.setImage('./images/player.png');

         this.minimapFrame = new Juicy.Entity(this, ['Image']);
         this.minimapFrame.setImage('./images/frame.png');
      },

      init: function() {

      },

      getMinimapColor: function(tile) {
         return MATERIALS[tile].pixel;
      },

      setMinimapPixel: function(index, tile) {
         var pixels = this.minimapPixels.data;
         var color = this.getMinimapColor(tile);

         pixels[4 * index] = color[0];
         pixels[4 * index + 1] = color[1];
         pixels[4 * index + 2] = color[2];
         pixels[4 * index + 3] = color[3];
      },

      updateTile: function(index, value) {
         this.world.tiles[index] = value;
         this.setMinimapPixel(index, value);
         this.updated = true;
      },

      generateMinimap: function() {
         var self = this;
         this.world.tiles.forEach(function(tile, index) {
            self.setMinimapPixel(index, tile);
         });
      },

      fetch: function() {
         var self = this;
         $.get('/api/world').then(function(world) {
            self.world = world;
            window.world = world
            self.updated = true;

            self.minimap.width = world.width;
            self.minimap.height = world.height;
            self.minimapPixels = new ImageData(new Uint8ClampedArray(4 * world.width * world.height), world.width, world.height);
            self.generateMinimap();
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

         this.updated |= this.mainChar.update();
         this.ticks ++;

         return true; // Don't rerender
      },

      activate: function(point) {
         if (!this.world)
            return;

         point.x = Math.floor(point.x / TerrainHelper.tilesize + this.camera.x + 0.5);
         point.y = Math.floor(point.y / TerrainHelper.tilesize + this.camera.y + 0.5);

         if (this.lastDrag && point.isEqual(this.lastDrag)) {
            return;
         }

         var index = point.x + point.y * this.world.width;
         // this.updateTile(index, (this.world.tiles[index] + 1) % 2);
         this.lastDrag = point;

         if (this.ui.action !== 'none') {
            this.connection.emit('activate', index, this.ui.action);
         }
      },

      mousewheel: function(e) {
         var dir = Math.sign(e.wheelDelta);
         var horizontal = e.getModifierState('Shift');

         var SCROLL_SLOW = 0.02;

         if (horizontal) {
            this.camera.x -= e.wheelDeltaY * SCROLL_SLOW;
            this.camera.y -= e.wheelDeltaX * SCROLL_SLOW;
         }
         else {
            this.camera.x -= e.wheelDeltaX * SCROLL_SLOW;
            this.camera.y -= e.wheelDeltaY * SCROLL_SLOW;
         }
         this.updated = true;
      },

      dragstart: function(point) {
         if (point.x > this.ui.position.x)
            return;

         this.activate(point);
      },

      drag: function(point) {
         if (point.x > this.ui.position.x)
            return;

         this.activate(point);
      },

      dragend: function(point) {
         this.lastDrag = null;
      },

      click: function(point) {
         if (point.x > this.ui.position.x) {
            this.ui.click(point);
            this.updated = true;

            return;
         }

         this.activate(point);
         this.lastDrag = null;
      },

      render: function(context, width, height) {
         if (!this.world || !TerrainHelper.ready) {
            return;
         }

         // Draw minimap
         this.minimap.getContext('2d').putImageData(this.minimapPixels, 0, 0);

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

         for (var i = min_x; (i - min_x) * TerrainHelper.tilesize <= width + 3 /* ???? */; i ++) {
            for (var j = min_y; (j - min_y) * TerrainHelper.tilesize <= height + 6 /* ???? */; j ++) {
               TerrainHelper.draw(context,
                                  i - this.camera.x,
                                  j - this.camera.y,
                                  this.world,
                                  i,
                                  j);
            }
         }

         this.minimapFrame.position.x = width - this.minimapFrame.width;
         this.minimapFrame.render(context);

         if (this.minimap) {
            var scale = 2;
            var minimap_x = width - this.minimap.width * scale - 4;
            var minimap_y = 4;

            context.drawImage(this.minimap,
                              minimap_x,
                              minimap_y,
                              this.minimap.width * scale,
                              this.minimap.height * scale);

            var viewport_w = scale * Math.floor(width / TerrainHelper.tilesize);
            var viewport_h = scale * Math.floor(height / TerrainHelper.tilesize);
            context.fillStyle = 'rgba(0, 0, 0, 0.3)';
            context.fillRect(minimap_x + scale * this.camera.x, minimap_y + scale * this.camera.y, viewport_w, viewport_h);
         }

         this.ui.position.x = width - this.minimapFrame.width;
         this.ui.position.y = this.minimapFrame.height;
         this.ui.height = height - this.minimapFrame.height;
         this.ui.render(context);
         this.mainChar.render(context);
      }
   })
})
