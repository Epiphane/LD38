define([
   'constants/materials',
   'components/world_map',
   'helpers/occupant',
   'helpers/terrain',
], function(
   MATERIALS,
   WorldMap,
   OccupantHelper,
   TerrainHelper
) {
   return Juicy.Entity.extend({
      components: [WorldMap],

      constructor: function(game, minimap) {
         Juicy.Entity.call(this, game);

         this.width = 0;
         this.height = 0;
         this.tiles = [];
         this.ready = false;

         this.minimap = minimap;
      },

      performUpdates: function(updates) {
         var self = this;
         updates.forEach(function(info) {
            switch (info[0]) {
            case 0: // tile
               self.setTile(info[1], info[2]);
               break;
            case 1: // occupant
               self.setOccupant(info[1], info[2]);
               break;
            }
         });
      },

      getElevation: function(x, y) {
         return this.elevation[x + y * this.width];
      },

      getMoisture: function(x, y) {
         return this.moisture[x + y * this.width];
      },

      getOccupant: function(x, y) {
         return this.occupants[x + y * this.width];
      },

      getTile: function(x, y) {
         return this.tiles[x + y * this.width];
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

         return promise.resolve([0 /* occupant */, index, value]);
      },

      setOccupant: function(index, value) {
         // Use a promise to match the functionality of sqldb/model/world
         var promise = $.Deferred();

         this.occupants[index] = value;
         this.getComponent('WorldMap').updateTile(this, index);

         return promise.resolve([1 /* occupant */, index, value]);
      },

      renderOccupant: function(context, x, y) {
         OccupantHelper.draw(context, this, x, y);
      }
   });
});