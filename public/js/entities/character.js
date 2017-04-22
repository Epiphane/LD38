define([
   'components/character'
], function(
   CharComponent
) {
   return Juicy.Entity.extend({
      components: [CharComponent],

      init: function() {
         this.action = 0;
      },
   })
})
