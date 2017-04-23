define([
   'helpers/terrain',
   'entities/ui',
   'entities/world',
   'entities/minimap',
   'entities/character',
   'controller/action',
   'controller/inventory',
   'helpers/math'
], function(
   TerrainHelper,
   UI,
   World,
   Minimap,
   Character,
   ActionController,
   Inventory,
   MathUtil
) {
   return Juicy.State.extend({
      constructor: function(connection) {
         this.sandbox = location.search.indexOf('sandbox') >= 0;
         this.connection = connection;

         this.minimap = new Minimap(this);
         this.world = new World(this, this.minimap);

         this.lastDrag = null;
         this.friends = {};

         var self = this;
         connection.on('connect', this.fetch.bind(this));
         connection.on('remake', this.fetch.bind(this));

         connection.on('updates', function(updates) {
            self.world.update(updates);
         });

         connection.on('player_pos_update', function(newPosition) {
            var movingFriend = self.friends[newPosition.uuid];
            if (!movingFriend) {
               movingFriend = new Character(this);
               self.friends[newPosition.uuid] = movingFriend;
            }
            movingFriend.getComponent('Character').walkToTile(newPosition.x, newPosition.y);
            movingFriend.getComponent('Character').direction = newPosition.direction;
         });

         this.cooldown = 0.2;
         this.timer = 0;
         this.ticks = 0;
         this.action_id = 0;

         this.camera = new Juicy.Point();

         this.ui = new UI(this, this.sandbox);
         this.mainChar = new Character(this);
         this.mainChar.uuid = MathUtil.makeUuid();

         this.minimapFrame = new Juicy.Entity(this, ['Image']);
         this.minimapFrame.setImage('./images/frame.png');

         this.inventory = new Inventory();
         if (this.sandbox)
            this.inventory.addItem('sandbox');
      },

      fetch: function() {
         var self = this;
         $.get('/api/world').then(function(world) {
            self.world.set(world);
         });
      },

      key_SPACE: function() {
         this.connection.emit('remake');
      },

      keypress: function(e) {
         // Numbah?
         if (e.keyCode >= 48 && e.keyCode <= 57) {
            this.ui.getComponent('UI').keypress(e.keyCode);
         }
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

      doAction: function(action, index) {
         var self = this;
         var _id = ++this.action_id;

         // Do the action client-side as well
         var localExecute = ActionController.action(this.world, index, action, this.inventory);
         if (!localExecute.then) localExecute = $.Deferred().resolve(localExecute);
         localExecute.then(function(localResult) {
            // TODO I wonder how much delay this introduces to sending out actions
            if (localResult.executed) {
               // We can ignore the updates cause they already happened lol

               self.connection.emit('action', index, action, _id);
               self.connection.onOnce('action_' + _id, function(response, message) {
                  if (response === 'fail') {
                     console.error('Server rejected action_' + _id + ': ' + message);
                     console.error('Backtracking is unimplemented');
                  }
               })
            }
            else {
               console.error('Invalid action: ' + localResult.reason);
            }
         });
      },

      action: function(action) {
         var x = this.mainChar.getComponent('Character').targetTileX;
         var y = this.mainChar.getComponent('Character').targetTileY;
         var index = x + y * this.world.width;

         return this.doAction(action, index);
      },

      activate: function(point) {
         if (!this.world)
            return;

         point.x = Math.floor((point.x + this.camera.x) / TerrainHelper.tilesize + 0.5);
         point.y = Math.floor((point.y + this.camera.y) / TerrainHelper.tilesize + 0.5);

         if (point.x < 0 || point.y < 0) return;

         // Sandbox off by default
         if (!this.sandbox) {
            if (point.x === 0) point.x = 1;
            if (point.y === 0) point.y = 1;
            if (point.x === this.world.width) point.x = this.world.width - 1;
            if (point.y === this.world.height) point.y = this.world.height - 1;

            this.mainChar.position = point.mult(TerrainHelper.tilesize);
         }
         else {
            if (!this.lastDrag) {
               this.lastDrag = point.add(new Juicy.Point(0, 1));
            }

            while (!this.lastDrag.isEqual(point)) {
               var dist = point.sub(this.lastDrag);
               this.lastDrag.x += Math.sign(dist.x);
               this.lastDrag.y += Math.sign(dist.y);

               var index = this.lastDrag.x + this.lastDrag.y * this.world.width;

               if (this.ui.action !== 'none') {
                  this.doAction('place_' + this.ui.action, index);
               }
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
         if (!this.world.ready || !TerrainHelper.ready) {
            return;
         }

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
         this.world.render(context, this.camera.x, this.camera.y, width, height);
         context.translate(-TerrainHelper.tilesize / 2, -TerrainHelper.tilesize / 2);
         this.mainChar.render(context);
         for (var friendID in this.friends) {
            this.friends[friendID].render(context);
         }
         context.restore();

         // Minimap frame
         this.minimapFrame.position.x = width - this.minimapFrame.width;
         this.minimapFrame.render(context);

         // Minimap
         {
            context.save();
            context.translate(this.minimapFrame.position.x + 4, this.minimapFrame.position.y + 4);
            context.scale(2, 2);

            this.minimap.render(context);

            // Cool lil black box over the minimap
            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(
               this.camera.x / TerrainHelper.tilesize, 
               this.camera.y / TerrainHelper.tilesize, 
               Math.floor(width / TerrainHelper.tilesize), 
               Math.floor(height / TerrainHelper.tilesize));

            context.restore();
         }

         this.ui.position.x = width - this.minimapFrame.width;
         this.ui.position.y = this.minimapFrame.height;
         this.ui.height = height - this.minimapFrame.height;
         this.ui.render(context);
      }
   })
})
