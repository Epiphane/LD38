define([
   'constants/tiles',
   'constants/tile_atlas'
], function(
   TILE,
   ATLAS
) {
   var waiting = 0;
   var onReadyCallbacks = [];
   function waitForImageLoad(image) {
      waiting ++;

      image.onload = function() {
         waiting --;

         if (waiting === 0) {
            while (onReadyCallbacks.length) {
               (onReadyCallbacks.shift())();
            }
         }
      }
   }

   var TerrainAtlas = new Image();
       TerrainAtlas.src = './images/terrain_atlas.png';
   waitForImageLoad(TerrainAtlas);

   var TerrainHelper = { tilesize: 32 };

   TerrainHelper.ready = function() {
      return waiting === 0;
   };

   TerrainHelper.onReady = function(callback) {
      if (TerrainHelper.ready)
         callback();
      else
         onReadyCallbacks.push(callback);
   };

   TerrainHelper.draw = function(context, dx, dy, world, x, y) {
      var index = x + y * world.width;
      var tiles = world.tiles;
      var tile = tiles[index];
      var offset = [0, 0]

      switch (tile) {
      case TILE.GRASS:
         offset = ATLAS.GRASS;
         break;
      case TILE.WATER:
         offset = ATLAS.WATER;
         break;
      }

      var tile_size = TerrainHelper.tilesize;
      context.drawImage(TerrainAtlas, 
                        offset[0] * tile_size, 
                        offset[1] * tile_size, 
                        tile_size, 
                        tile_size,
                        Math.floor(dx * tile_size),
                        Math.floor(dy * tile_size),
                        tile_size,
                        tile_size);
   };

   return TerrainHelper;
})