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

   TerrainHelper.terrainAt = function(world, x, y) {
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x >= world.width) x = world.width - 1;
      if (y >= world.height) y = world.height - 1;

      return world.tiles[x + y * world.width];
   };

   TerrainHelper.draw = function(context, dx, dy, world, x, y) {
      var tile = TerrainHelper.terrainAt(world, x, y);
      var offset = [0, 0];

      switch (tile) {
      case TILE.GRASS:
         var randomish = (x * y + y * 3) % ATLAS.GRASS.length;
         offset = ATLAS.GRASS[randomish];

         if (TerrainHelper.terrainAt(world, x + 1, y) === TILE.WATER) {
            offset = ATLAS.GRASS_WATER_R;
         }
         else if (TerrainHelper.terrainAt(world, x - 1, y) === TILE.WATER) {
            offset = ATLAS.GRASS_WATER_L;
         }
         else if (TerrainHelper.terrainAt(world, x, y - 1) === TILE.WATER) {
            offset = ATLAS.GRASS_WATER_T;
         }
         else if (TerrainHelper.terrainAt(world, x, y + 1) === TILE.WATER) {
            offset = ATLAS.GRASS_WATER_B;
         }
         else if (TerrainHelper.terrainAt(world, x - 1, y - 1) === TILE.WATER) {
            offset = ATLAS.GRASS_WATER_TL;
         }
         else if (TerrainHelper.terrainAt(world, x + 1, y - 1) === TILE.WATER) {
            offset = ATLAS.GRASS_WATER_TR;
         }
         else if (TerrainHelper.terrainAt(world, x - 1, y + 1) === TILE.WATER) {
            offset = ATLAS.GRASS_WATER_BL;
         }
         else if (TerrainHelper.terrainAt(world, x + 1, y + 1) === TILE.WATER) {
            offset = ATLAS.GRASS_WATER_BR;
         }
         break;
      case TILE.WATER:
         var score = 0;
         if (x === y * 3) score ++;
         offset = ATLAS.WATER[score];
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