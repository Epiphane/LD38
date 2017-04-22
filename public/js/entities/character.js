define([
   'components/character',
   'components/sprite'
], function(
   CharComponent,
   SpriteComponent
) {
   return Juicy.Entity.extend({
      components: [CharComponent, SpriteComponent],

      init: function() {
         this.action = 0;  
      },
   })
})
