define([
   'components/sprite'
], function(
   SpriteComponent
) {
   return Juicy.Component.create('Character', {
      x: 0,
      y: 0,

      // Walk cycle frame stuff
      walkAnimSpeed: 4,
      walkStartFrame: 0,
      walkEndFrame: 3,
      walkOffset: 1,

      attackAnimSpeed: 4,
      attackStartFrame: 6,
      attackEndFrame: 9,

      direction: 0,

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

      move: function(dx, dy) {
         if (dx ===  1) this.direction = 2;
         if (dx === -1) this.direction = 1;
         if (dy ===  1) this.direction = 0;
         if (dy === -1) this.direction = 3;
      },

      update: function() {
         var originalFrame = this.entity.getComponent('Image').frame;

         if (this.isMoving()) {
            // Animate through the character's walk cycle every three frames
            if (this.entity.state.ticks % this.walkAnimSpeed === 0) {
               var walkCycleLength = this.walkEndFrame - this.walkStartFrame;
               this.walkOffset = ++this.walkOffset % walkCycleLength;
            }

            this.entity.getComponent('Image').frame = this.walkStartFrame + this.walkOffset;
         }
         else if (this.isAttacking()) {
            if (this.entity.state.ticks % this.attackAnimSpeed === 0) {
               this.attackOffset = ++this.attackOffset % this.attackLength;
            }

            var attackCycleLength = this.attackEndFrame - this.attackStartFrame;
            var attackFrame = this.attackOffset % attackCycleLength;
            this.entity.getComponent('Image').frame = this.attackStartFrame + attackFrame;
         }
         else {
            this.entity.getComponent('Image').frame = this.walkStartFrame;
         }

         this.entity.getComponent('Image').frame += this.getDirectionFrame();

         return originalFrame != this.entity.getComponent('Image').frame; // Returns TRUE if needs redraw
      },
   });
});
