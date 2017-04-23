define([
   'constants/materials',
   'components/world_map',
   'helpers/terrain',
], function(
   MATERIALS,
   WorldMap,
   TerrainHelper
) {
   return Juicy.Entity.extend({
      components: [WorldMap],

      constructor: function(game, minimap) {
         Juicy.Entity.call(this);

         this.width = 0;
         this.height = 0;
         this.tiles = [];
         this.ready = false;

         this.minimap = minimap;
      },

      set: function(properties) {
         Object.assign(this, properties);

         this.minimap.generate(this);
         this.getComponent('WorldMap').generate(this);

         this.ready = true;
      },

      setTile: function(index, value) {
         // Use a promise to match the functionality of sqldb/model/world
         var promise = $.Deferred();

         this.minimap.setPixel(index, value);

         this.tiles[index] = value;
         this.getComponent('WorldMap').updateTile(this, index);

         return promise.resolve([index, value]);
      }
   });
});