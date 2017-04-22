define([
   'constants/tiles',
   'constants/materials'
], function(
   TILE,
   MATERIALS
) {
   var AtlasHelper = {};

   var G = TILE.GRASS;
   var W = TILE.WATER;
   AtlasHelper.offsets = {};
   var configs = {
      GRASS_UI: { offset: [3, 0] },
      WATER_UI: { offset: [3, 1] },
      SAND_UI: { offset: [0, 2] },
      DIRT_UI: { offset: [0, 4] },
      GRASS: {
         multiple: true,
         offset: [[22, 3], [21, 5], [22, 5], [23, 5]],
         tiles: [G, G, G, G]
      },
      WATER: {
         offset: [[8, 14], [3, 14]],
         tiles: [W, W, W, W]
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

   AtlasHelper.getOffset = function(tl, tr, bl, br, i) {
      var score = AtlasHelper.getScore(tl, tr, bl, br);
      if (!tileMap[score]) {
         //console.error('No offset found for:', tl, tr, bl, br);

         return [1, 1];
      }
      var offset = tileMap[score];
      if (typeof(offset[0]) !== 'number') {
         i = i || 0;
         offset = offset[i % offset.length];
      }
      return offset;
   };

   /**
    * tiles is a number representing 4 pieces of info:
    *   0x1 means the top left is applicable
    *   0x2 means the top right
    *   0x4 means the bottom left
    *   0x8 means the bottom right
    * inverse refers to whether this is an "above" offset or a "below" offset
    */
   AtlasHelper.getOffsetFromApplicableTiles = function(tiles, inverse) {
      switch (tiles) {
      case 0x1: return !inverse ? [3, 2] : [0, 1];
      case 0x2: return !inverse ? [0, 3] : [1, 1];
      case 0x4: return !inverse ? [3, 1] : [0, 2];
      case 0x8: return !inverse ? [0, 0] : [1, 2];

      case 0x3: return !inverse ? [2, 2] : [2, 1];
      case 0x5: return !inverse ? [3, 3] : [2, 3];
      case 0x9: return !inverse ? [1, 3] : [3, 0];
      
      case 0x6: return !inverse ? [1, 0] : [2, 0];
      case 0xA: return !inverse ? [2, 3] : [3, 3];

      case 0xC: return !inverse ? [2, 1] : [2, 2];
      
      case 0x7: return !inverse ? [1, 2] : [0, 0];
      case 0xB: return !inverse ? [0, 2] : [3, 1];
      case 0xD: return !inverse ? [1, 1] : [0, 3];
      case 0xE: return !inverse ? [0, 1] : [3, 2];

      case 0xF: 
         console.error('You should only get offset for non-basic tiles');
         return null;
      }
   };

   /**
    * Returns a list of offsets, in draw order (bottom up).
    * AtlasHelper takes care of actually combining the images correctly
    */
    window.AtlasHelper = AtlasHelper
   AtlasHelper.getOffsets = function(tl, tr, bl, br, i) {
      var mTL = MATERIALS[tl],
          mTR = MATERIALS[tr],
          mBL = MATERIALS[bl],
          mBR = MATERIALS[br];
      var mats = [mTL, mTR, mBL, mBR];

      var baseOffset = [3, 3];
      var baseHeight = 100;
      var maxHeight = -100;
      mats.forEach(function(mat) {
         if (mat.height < baseHeight) { baseOffset = mat.offset_below; baseHeight = mat.height; }
         if (mat.height > maxHeight) { maxHeight = mat.height; }
      });

      var baseHeight = Math.min(mTL.height, mTR.height, mBL.height, mBR.height);

      var baseTiles  = 0;
      mats.forEach(function(mat, i) { if (mat.height === baseHeight) { baseTiles += (1 << i); } });
      var offset = Object.assign({}, baseOffset);
      if (baseTiles === 0xF) {
         Object.assign(offset, mTL.offset_basic);
         offset[0] += i % 3;
      }
      else {
         var b_off = AtlasHelper.getOffsetFromApplicableTiles(baseTiles, true /* inverse */);
         offset[0] += b_off[0];
         offset[1] += b_off[1];
      }

      var offsets = [offset];

      while (++baseHeight <= maxHeight) {
         var tiles    = 0;
         var material = null;
         mats.forEach(function(mat, i) { 
            if (mat.height === baseHeight) { tiles += (1 << i); material = mat; } 
         });

         if (material) {
            var off = AtlasHelper.getOffsetFromApplicableTiles(tiles);
            off[0] += material.offset_above[0];
            off[1] += material.offset_above[1];

            offsets.push(off);
         }
      }

      return offsets;
   };

   for (var key in configs) {
      if (!configs.hasOwnProperty(key)) {
         continue;
      }

      var config = configs[key];
      var tiles = config.tiles;
      AtlasHelper.offsets[key] = config.offset;
      if (!tiles) {
         continue;
      }

      AtlasHelper.registerTile(config.offset, tiles[0], tiles[1], tiles[2], tiles[3]);
   }

   return AtlasHelper;
});