define([
   'components/ui'
], function(
   UIComponent
) {
   return Juicy.Entity.extend({
      components: ['Box', UIComponent],

      init: function() {
         this.getComponent('Box').fillStyle = 'rgba(0, 0, 0, 0.9)';
         this.width = this.height = 208;

         this.action = 0;
      },

      click: function(point) {
         this.getComponent('UI').click(point.sub(this.position));
      }
   })
})