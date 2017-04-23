define([
   'helpers/terrain',
], function(
   TerrainHelper
) {
   return Juicy.Component.create('WorldMap', {
      constructor: function() {
         // For drawing
         this.canvas = document.createElement('canvas');
         this.context = this.canvas.getContext('2d');
      },

      generate: function(world) {
         this.canvas.width  = world.width * TerrainHelper.tilesize;
         this.canvas.height = world.height * TerrainHelper.tilesize;

         for (var i = 0; i < world.width; i ++) {
            for (var j = 0; j < world.height; j ++) {
               TerrainHelper.draw(this.context, i, j, world, i, j);
            }
         }
      },

      updateTile: function(world, index) {
         var x = index % world.width;
         var y = Math.floor(index / world.width);

         for (var i = x - 1; i <= x; i ++) {
            for (var j = y - 1; j <= y; j ++) {
               if (i < 0 || j < 0) continue;

               TerrainHelper.draw(this.context, i, j, world, i, j);
            }
         }
      },

      render: function(context, x, y, w, h) {
         context.drawImage(this.canvas, 
                           x, y, w, h, /* source */
                           x, y, w, h  /* dest */);
      }
   });
});