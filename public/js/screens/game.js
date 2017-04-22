define([], function() {
   return Juicy.State.extend({
      constructor: function() {

      },

      init: function() {

      },

      update: function(dt) {
         return true; // Don't rerender
      },

      render: function(context, width, height) {
         var colors = ['black', 'green', 'red', 'yellow', 'white', 'pink', 'purple', 'blue'];

         var tilesize = 40;
         for (var i = 0; i < width; i += tilesize) {
            for (var j = 0; j < height; j += tilesize) {
               context.fillStyle = colors[Math.floor(Math.random() * colors.length)];
               context.fillRect(i, j, tilesize, tilesize);
            }
         }
      }
   })
})