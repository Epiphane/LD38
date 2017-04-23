var Promise          = require('promise');
var FastSimplexNoise = require('fast-simplex-noise').default;

module.exports = function(TILE, OCCUPANT) {
   var RemakeWorld = function(params) {
      this.height = params.height || 100;
      this.width  = params.width  || 100;
   };

   RemakeWorld.remake = function(width, height) {
      var tiles = [];
      var occupants = [];
      var simplex = new FastSimplexNoise({ frequency: 0.01, max: 3, min: -1, octaves: 8 });

      for (var x = 0; x < width; x ++) {
         for (var y = 0; y < height; y ++) {
            var tile = TILE.SNOW;
            var elevation = simplex.scaled2D(x, y);

            if (elevation < 1.5)
               tile = TILE.STONE;
            if (elevation < 0.9)
               tile = TILE.GRASS;
            if (elevation < 0.5)
               tile = TILE.SAND;
            if (elevation < 0)
               tile = TILE.WATER;

            tiles.push(tile);
            occupants.push(0);
         }
      }

      return {
         tiles: tiles,
         occupants: occupants
      };
   }

   RemakeWorld.prototype.init = function(world, socket) {
      var self = this;
      return new Promise(function(resolve, reject) {
         socket.emit('remake', RemakeWorld.remake(self.width, self.height));
         socket.once('remake', function(success, err) {
            if (!success) {
               reject(err);
            }
            else {
               resolve();
            }
         })
      });
   };

   RemakeWorld.prototype.tick = function() {};

   return RemakeWorld;
}