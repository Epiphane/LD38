define([
   'components/character',
   'components/sprite'
], function(
   CharComponent,
   SpriteComponent
) {
   return Juicy.Entity.extend({
      components: [CharComponent, 'Image'],

      init: function() {
         this.action = 0;
         this.getComponent('Image').TILE_WIDTH  = 32;
         this.getComponent('Image').TILE_HEIGHT = 32;
      },
   })
})
