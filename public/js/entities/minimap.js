define([
   'constants/materials',
   'components/minimap',
   'helpers/terrain',
], function(
   MATERIALS,
   Minimap,
   TerrainHelper
) {
   return Juicy.Entity.extend({
      components: [Minimap],

      generateMap: function() {
         this.canvas.width  = this.world.width * TerrainHelper.tilesize;
         this.canvas.height = this.world.height * TerrainHelper.tilesize;
         var context = this.canvas.getContext('2d');

         for (var i = 0; i < this.world.width; i ++) {
            for (var j = 0; j < this.world.height; j ++) {
               TerrainHelper.draw(context,
                                  i,
                                  j,
                                  this.world,
                                  i,
                                  j);
            }
         }

      },

      set: function(properties) {
         Object.assign(this, properties);

         self.minimap.width = this.width;
         self.minimap.height = this.height;
         self.minimapPixels = new ImageData(new Uint8ClampedArray(4 * this.width * this.height), this.width, this.height);

         this.ready = true;
      },

      generate: function(world) {
         var minimap = this.getComponent('Minimap');

         minimap.setSize(world.width, world.height);
         minimap.generate(world);
      },

      setMapTile: function(index, tile) {
         this.world.tiles[index] = tile;
         var x = index % this.world.width;
         var y = Math.floor(index / this.world.width);

         for (var i = x - 1; i <= x; i ++) {
            for (var j = y - 1; j <= y; j ++) {
               if (i < 0 || j < 0) continue;

               TerrainHelper.draw(this.canvas.getContext('2d'),
                                  i,
                                  j,
                                  this.world,
                                  i,
                                  j);
            }
         }
      },

      setTile: function(index, value) {
         // Use a promise to match the functionality of sqldb/model/world
         var promise = $.Deferred();

         this.setMinimapPixel(index, value);
         this.setMapTile(index, value);

         return promise.resolve([index, value]);
      }
   });
});