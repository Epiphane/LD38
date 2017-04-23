define([
   'constants/tiles'
], function(
   TILE
) {
   var materialMap = {
      GRASS: {
         offset_basic: [0,  0],
         offset_above: [6,  0],
         pixel: [47, 129, 54, 255]
      },
      SAND: {
         offset_basic: [0,  2],
         offset_above: [6,  8],
         pixel: [218, 215, 52, 255]
      },
      WATER: {
         offset_basic: [0,  1],
         offset_above: [6, 12],
         offset_below: [10, 0],
         pixel: [21, 108, 153, 255]
      },
      DIRT: {
         offset_basic: [0,  4],
         offset_above: [6,  4],
         pixel: [129, 92, 28, 255]
      },
      SOIL: {
         offset_basic: [0,  5],
         offset_above: [10, 4],
         pixel: [100, 80, 18, 255]
      },
      SOIL_WET: {
         offset_basic: [0,  6],
         offset_above: [10, 8],
         pixel: [100, 80, 18, 255]
      },
      SNOW: {
         offset_basic: [0, 10],
         offset_above: [14, 4],
         pixel: [255, 255, 255, 255]
      },
      STONE: {
         offset_basic: [0, 13],
         offset_above: [6, 12],
         pixel: [128, 128, 128, 255]
      },
      ICE: {
         offset_basic: [0, 14],
         offset_above: [10, 12],
         pixel: [176, 242, 255, 255]
      }
   };
   var precedence = ['ICE', 'SNOW', 'STONE', 'GRASS', 'DIRT', 'SOIL', 'SOIL_WET', 'SAND', 'WATER'].reverse();

   var MATERIALS = [];
   for (var key in TILE) {
      materialMap[key].height = precedence.indexOf(key);
      materialMap[key].key = key;
      if (materialMap[key].height < 0) {
         console.error('Height precedence for ' + key + ' not set');
      }
      MATERIALS[TILE[key]] = materialMap[key];
   }

   return MATERIALS;
})