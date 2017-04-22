define([
   'components/sprite'
], function(
   SpriteComponent
) {
   return Juicy.Component.create('Character', {
      x: 0,
      y: 0,

      // Walk cycle frame stuff
      walkAnimSpeed: 3,
      walkStartFrame: 0,
      walkOffset: 0,

      isMoving: function() {
         return false;
      },

      isAttacking: function() {
         return false;
      },

      /*
       * If the sprite has different rows for each direction,
       * you can add specialized code here.
       */
      getDirectionFrame: function() {
         return 0;
      },

      update: function() {
         var originalFrame = this.frame;

         if (this.isMoving()) {
            // Animate through the character's walk cycle every three frames
            if (this.state.game.ticks % this.walkAnimSpeed === 0) {
               var walkCycleLength = this.walkEndFrame - this.walkStartFrame;
               this.walkOffset = ++this.walkOffset % walkCycleLength;
               didChange = true;
            }

            this.frame = this.walkStartFrame + this.walkOffset;
         }
         else if (this.isAttacking()) {
            if (this.state.game.ticks % this.attackAnimSpeed === 0) {
               this.attackOffset = ++this.attackOffset % this.attackLength;
               didChange = true;
            }

            var attackCycleLength = this.attackEndFrame - this.attackStartFrame;
            var attackFrame = this.attackOffset % attackCycleLength;
            this.frame = this.attackStartFrame + attackFrame;
         }
         else {
            this.frame = this.walkStartFrame;
         }

         this.frame += this.getDirectionFrame();

         return originalFrame != this.frame; // Returns TRUE if needs redraw
      },
   });
});
