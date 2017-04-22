define([
   'constants/tiles'
], function(
   TILE
) {
   var AtlasHelper = {};

   var G = TILE.GRASS;
   var W = TILE.WATER;
   var configs = {
      GRASS: {
         offset: [22, 3],
         tiles: [G, G, G, G]
         // [22, 3], 
         // [22, 3], 
         // [22, 3], 
         // [22, 5], 
         // [23, 5]
      },
      WATER: {
         offset: [8, 14],
         tiles: [W, W, W, W]
         // [8, 14],
         // [3, 14],
         // [4, 14],
         // [5, 14],
         // [6, 14],
         // [7, 14]
      },
      GRASS_WATER_BR: {
         offset: [6, 11],
         tiles: [G, G, G, W]
      },
      GRASS_WATER_B:  {
         offset: [7, 11],
         tiles: [G, G, W, W]
      },
      GRASS_WATER_BL: {
         offset: [8, 11],
         tiles: [G, G, W, G]
      },
      GRASS_WATER_R:  {
         offset: [6, 12],
         tiles: [G, W, G, W]
      },
      GRASS_WATER_L:  {
         offset: [8, 12],
         tiles: [W, G, W, G]
      },
      GRASS_WATER_TR: {
         offset: [6, 13],
         tiles: [G, W, G, G]
      },
      GRASS_WATER_T:  {
         offset: [7, 13],
         tiles: [W, W, G, G]
      },
      GRASS_WATER_TL: {
         offset: [8, 13],
         tiles: [W, G, G, G]
      },
      WATER_GRASS_BR: {
         offset: [7, 9],
         tiles: [W, W, W, G]
      },
      WATER_GRASS_BL: {
         offset: [8, 9],
         tiles: [W, W, G, W]
      },
      WATER_GRASS_TR: {
         offset: [7, 10],
         tiles: [W, G, W, W]
      },
      WATER_GRASS_TL: {
         offset: [8, 10],
         tiles: [G, W, W, W]
      },
      GRASS_SPLIT_WATER_1: {
         offset: [9, 7],
         tiles: [G, W, W, G]
      },
      GRASS_SPLIT_WATER_2: {
         offset: [9, 8],
         tiles: [W, G, G, W]
      }
   };

   // key specifies a "score": each byte is one of the tiles
   // organized by top left, top right, bottom left, bottom right
   var tileMap = window.tileMap = {};

   AtlasHelper.getScore = function(tl, tr, bl, br) {
      var score = 0;
      score += tl; score <<= 8;
      score += tr; score <<= 8;
      score += bl; score <<= 8;
      score += br;

      return score;
   };

   AtlasHelper.registerTile = function(offset, tl, tr, bl, br) {
      var score = AtlasHelper.getScore(tl, tr, bl, br);

      tileMap[score] = offset;
   };

   AtlasHelper.getOffset = function(tl, tr, bl, br) {
      var score = AtlasHelper.getScore(tl, tr, bl, br);
      if (!tileMap[score]) {
         console.error('No offset found for:', tl, tr, bl, br);

         return tilemap[0];
      }
      return tileMap[score];// || configs.G;
   };

   for (var key in configs) {
      if (!configs.hasOwnProperty(key)) {
         continue;
      }

      var config = configs[key];
      var tiles = config.tiles;
      AtlasHelper.registerTile(config.offset, tiles[0], tiles[1], tiles[2], tiles[3]);
   }

   return AtlasHelper;
});