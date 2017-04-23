define([
   'constants/occupants',
], function(
   OCCUPANT
) {
   var OccupantMap = {
      WHEAT_SEED: {
         offset: [0, 0]
      },
      WHEAT_SPROUT: {
         offset: [1, 0]
      },
      WHEAT_GROWING: {
         offset: [2, 0]
      },
      WHEAT_COMPLEAT: {
         offset: [3, 0],
         size:   [1, 2]
      }
   };
   var OccupantArray = [];
   for (var key in OCCUPANT) {
      OccupantArray[OCCUPANT[key]] = OccupantMap[key];
   }

   var OccupantImage = new Image();
       OccupantImage.src = './images/occupants.png';

   var OccupantHelper = { tilesize: 32 };

   OccupantHelper.occupantAt = function(world, x, y) {
      if (x < 0) return 0;
      if (y < 0) return 0;
      if (x >= world.width) return 0;
      if (y >= world.height) return 0;

      return world.occupants[x + y * world.width];
   };

   OccupantHelper.drawOffset = function(context, dx, dy, dwidth, dheight, offset) {
      var tile_size = OccupantHelper.tilesize;
      context.drawImage(OccupantImage, 
                        offset[0] * tile_size, 
                        offset[1] * tile_size, 
                        dwidth * tile_size, 
                        dheight * tile_size,
                        dx * tile_size,
                        dy * tile_size,
                        dwidth * tile_size,
                        dheight * tile_size);
   };

   OccupantHelper.draw = function(context, world, x, y) {
      var tile_size = OccupantHelper.tilesize;
      var occupant = OccupantHelper.occupantAt(world, x, y);

      if (!occupant)
         return;

      // OCCUPANT OCCUPANT OCCUPANT
      var occupantInfo = OccupantArray[occupant];
      var offset = occupantInfo.offset;
      var size   = occupantInfo.size   || [1, 1];
      var anchor = occupantInfo.anchor || [0, 0];

      var dx = (x - 0.5 - anchor[0]);
      var dy = (y + 0.5 + anchor[1] - size[1]);
      OccupantHelper.drawOffset(context, dx, dy, size[0], size[1], offset);

      return;
      var tiles = [
         OccupantHelper.occupantAt(world, x,   y),
         OccupantHelper.occupantAt(world, x+1, y),
         OccupantHelper.occupantAt(world, x,   y+1),
         OccupantHelper.occupantAt(world, x+1, y+1)
      ];
      // var offsets = Atlas.getOffsets(tiles[0], tiles[1], tiles[2], tiles[3], x ^ y);
      var offsets = [[0, 0]];

      var tile_size = OccupantHelper.tilesize;
      offsets.forEach(function(offset) {
         OccupantHelper.drawOffset(context, (x - 0.5) * tile_size, (y - 0.5) * tile_size, offset);
      });
   };

   return OccupantHelper;
})