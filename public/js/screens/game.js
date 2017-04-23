define([
   'constants/materials',
   'helpers/terrain',
   'entities/ui',
   'entities/character',
   'helpers/math'
], function(
   MATERIALS,
   TerrainHelper,
   UI,
   Character,
   MathUtil
) {
   return Juicy.State.extend({
      constructor: function(connection) {
         this.connection = connection;

         this.world = null;
         this.lastDrag = null;
         this.friends = {};

         var self = this;
         connection.on('connect', this.fetch.bind(this));
         connection.on('remake', this.fetch.bind(this));

         connection.on('updates', function(updates) {
            updates.forEach(function(info) {
               self.updateTile(info[0], info[1]);
            });
         });

         connection.on('player_pos_update', function(newPosition) {
            var movingFriend = self.friends[newPosition.uuid];
            if (!movingFriend) {
               movingFriend = new Character(this);
               self.friends[newPosition.uuid] = movingFriend;
            }
            movingFriend.getComponent('Character').walkToTile(newPosition.x, newPosition.y);
            movingFriend.direction = newPosition.direction;
         });

         this.cooldown = 0.2;
         this.timer = 0;
         this.ticks = 0;

         this.camera = new Juicy.Point();

         this.canvas = document.createElement('canvas');
         this.context = this.canvas.getContext('2d');

         this.minimap = document.createElement('canvas');
         this.minimapPixels = null;

         this.ui = new UI(this);
         this.mainChar = new Character(this);
         this.mainChar.uuid = MathUtil.makeUuid();

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

      setMapTile: function(index, tile) {
         this.world.tiles[index] = tile;
         var x = index % this.world.width;
         var y = Math.floor(index / this.world.width);

         for (var i = x - 1; i <= x; i ++) {
            for (var j = y - 1; j <= y; j ++) {
               if (i < 0 || j < 0) continue;

               TerrainHelper.draw(this.canvas.getContext('2d'),
                                  i,
                                  j,
                                  this.world,
                                  i,
                                  j);
            }
         }
      },

      updateTile: function(index, value) {
         this.setMinimapPixel(index, value);
         this.setMapTile(index, value);
      },

      generateMap: function() {
         this.canvas.width  = this.world.width * TerrainHelper.tilesize;
         this.canvas.height = this.world.height * TerrainHelper.tilesize;
         var context = this.canvas.getContext('2d');

         for (var i = 0; i < this.world.width; i ++) {
            for (var j = 0; j < this.world.height; j ++) {
               TerrainHelper.draw(context,
                                  i,
                                  j,
                                  this.world,
                                  i,
                                  j);
            }
         }

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
            self.generateMap();

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
         var character = this.mainChar.getComponent('Character');

         if (!character.moving) {
            if (game.keyDown('LEFT')) {
               character.move(-1, 0, this.connection);
            }
            else if (game.keyDown('RIGHT')) {
               character.move(1, 0, this.connection);
            }
            else if (game.keyDown('UP')) {
               character.move(0, -1, this.connection);
            }
            else if (game.keyDown('DOWN')) {
               character.move(0, 1, this.connection);
            }
         }

         this.mainChar.update();
         for (var friendID in this.friends) {
            this.friends[friendID].update();
         }
         this.ticks ++;

         this.ui.update(dt);
      },

      action: function(action) {
         if (action !== 'none') {
            var point = this.mainChar.position.mult(1 / TerrainHelper.tilesize);
            var index = point.x + point.y * this.world.width;

            this.connection.emit('action', index, action);
         }
      },

      activate: function(point) {
         if (!this.world)
            return;

         // Sandbox off by default
         if (!window.SANDBOX) {
            point.x = Math.floor(point.x / TerrainHelper.tilesize + this.camera.x / TerrainHelper.tilesize);// + 0.5);
            point.y = Math.floor(point.y / TerrainHelper.tilesize + this.camera.y / TerrainHelper.tilesize);// + 0.5);

            this.mainChar.position = point.mult(TerrainHelper.tilesize);
         }
         else {
            point.x = Math.floor((point.x + this.camera.x) / TerrainHelper.tilesize + 0.5);
            point.y = Math.floor((point.y + this.camera.y) / TerrainHelper.tilesize + 0.5);

            if (this.lastDrag && point.isEqual(this.lastDrag)) {
               return;
            }

            var index = point.x + point.y * this.world.width;
            // this.updateTile(index, (this.world.tiles[index] + 1) % 2);
            this.lastDrag = point;

            if (this.ui.action !== 'none') {
               this.connection.emit('action', index, this.ui.action);
            }
         }
      },

      mousewheel: function(e) {
         var dir = Math.sign(e.wheelDelta);
         var horizontal = e.getModifierState('Shift');

         var SCROLL_SLOW = 0.5;

         if (horizontal) {
            this.camera.x -= e.wheelDeltaY * SCROLL_SLOW;
            this.camera.y -= e.wheelDeltaX * SCROLL_SLOW;
         }
         else {
            this.camera.x -= e.wheelDeltaX * SCROLL_SLOW;
            this.camera.y -= e.wheelDeltaY * SCROLL_SLOW;
         }
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
         if (this.camera.x + width > this.world.width * TerrainHelper.tilesize)
            this.camera.x = this.world.width * TerrainHelper.tilesize - width;
         if (this.camera.y + height > this.world.height * TerrainHelper.tilesize)
            this.camera.y = this.world.height * TerrainHelper.tilesize - height;

         // Draw pre-rendered map
         context.save();
         context.translate(-this.camera.x, -this.camera.y);
         context.drawImage(this.canvas, this.camera.x, this.camera.y, width, height, this.camera.x, this.camera.y, width, height);
         this.mainChar.render(context);
         for (var friendID in this.friends) {
            this.friends[friendID].render(context);
         }
         context.restore();

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
            context.fillRect(minimap_x + scale * this.camera.x / TerrainHelper.tilesize, minimap_y + scale * this.camera.y / TerrainHelper.tilesize, viewport_w, viewport_h);
         }

         this.ui.position.x = width - this.minimapFrame.width;
         this.ui.position.y = this.minimapFrame.height;
         this.ui.height = height - this.minimapFrame.height;
         this.ui.render(context);
      }
   })
})
