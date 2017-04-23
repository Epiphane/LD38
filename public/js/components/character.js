define([
   'components/sprite',
   'helpers/terrain',
   'helpers/math'
], function(
   SpriteComponent,
   TerrainHelper,
   MathUtil
) {
   return Juicy.Component.create('Character', {
      tileX: 0,
      tileY: 0,
      targetTileX: 0,
      targetTileY: 0,

      // Walk cycle frame stuff
      walkAnimSpeed: 4,
      walkStartFrame: 0,
      walkEndFrame: 3,
      walkOffset: 1,

      attackAnimSpeed: 4,
      attackStartFrame: 6,
      attackEndFrame: 9,

      direction: 0,
      moving: false,

      // How many ticks it takes to go from one tile to the next
      ticksPerMovement: 7,
      ticksMoved: 0,

      isMoving: function() {
         return true;
      },

      isAttacking: function() {
         return false;
      },

      /*
       * If the sprite has different rows for each direction,
       * you can add specialized code here.
       */
      getDirectionFrame: function() {
         return 9 * this.direction;
      },

      walkToTile(newTileX, newTileY) {
         this.targetTileX = newTileX;
         this.targetTileY = newTileY;
         this.targetX = this.targetTileX * TerrainHelper.tilesize;
         this.targetY = this.targetTileY * TerrainHelper.tilesize;
         this.premoveX = this.entity.position.x;
         this.premoveY = this.entity.position.y;

         this.moving = true;
         this.ticksMoved = 0;
      },

      move: function(dx, dy, conn) {
         if (this.moving === false) {
            if (dx ===  1) this.direction = 2;
            if (dx === -1) this.direction = 1;
            if (dy ===  1) this.direction = 0;
            if (dy === -1) this.direction = 3;

            this.walkToTile(this.tileX + dx, this.tileY + dy);

            if (conn) {
               conn.emit('player_pos', {
                  x: this.targetTileX,
                  y: this.targetTileY,
                  direction: this.direction,
                  uuid: this.entity.uuid
               });
            }
         }
      },

      doWalkAnim: function() {
         if (this.moving) {
            // Animate through the character's walk cycle every three frames
            if (this.entity.state.ticks % this.walkAnimSpeed === 0) {
               var walkCycleLength = this.walkEndFrame - this.walkStartFrame;
               this.walkOffset = ++this.walkOffset % walkCycleLength;
            }

            this.entity.getComponent('Image').frame = this.walkStartFrame + this.walkOffset;
         }
         else {
            this.entity.getComponent('Image').frame = this.walkStartFrame;
         }
      },

      update: function() {
         this.doWalkAnim();

         if (this.moving) {
            this.ticksMoved ++;
            this.entity.position.x = MathUtil.lerp(this.premoveX, this.targetX,
                this.ticksMoved / this.ticksPerMovement);
            this.entity.position.y = MathUtil.lerp(this.premoveY, this.targetY,
                this.ticksMoved / this.ticksPerMovement);

            if (this.ticksMoved >= this.ticksPerMovement) {
               this.moving = false;
               this.premoveX = this.entity.position.x;
               this.premoveY = this.entity.position.y;
               this.tileX = this.targetTileX;
               this.tileY = this.targetTileY;
            }
         }

         this.entity.getComponent('Image').frame += this.getDirectionFrame();
      },
   });
});
