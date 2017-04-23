define([
   'constants/tiles'
], function(
   TILE
) {
   var materialMap = {
      GRASS: {
         height: 4,
         offset_basic: [0,  0],
         offset_above: [6,  0],
         offset_below: [10, 0],
         pixel: [47, 129, 54, 255]
      },
      SAND: {
         height: 1,
         offset_basic: [0,  2],
         offset_above: [6,  8],
         offset_below: [10, 8],
         pixel: [218, 215, 52, 255]
      },
      WATER: {
         height: 0,
         offset_basic: [0,  1],
         offset_above: [6,  12],
         offset_below: [10, 12],
         pixel: [21, 108, 153, 255]
      },
      DIRT: {
         height: 3,
         offset_basic: [0,  4],
         offset_above: [6,  4],
         offset_below: [10, 4],
         pixel: [129, 92, 28, 255]
      },
      SOIL: {
         height: 2,
         offset_basic: [0,  5],
         offset_above: [6,  16],
         offset_below: [10, 16],
         pixel: [100, 80, 18, 255]
      }
   };

   var MATERIALS = [];
   for (var key in TILE) {
      MATERIALS[TILE[key]] = materialMap[key]
   }

   return MATERIALS;
})