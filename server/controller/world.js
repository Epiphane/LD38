'use strict';

var Promise = require('promise');
var sqldb = require('../sqldb');
var TILE  = require('../tiles');
var World = sqldb.World;

var FastSimplexNoise = require('fast-simplex-noise').default;

var worldInMemory = null;
var WorldController = module.exports = function() {};

WorldController.generate = function(width, height) {
   var tiles = [];
   var simplex = new FastSimplexNoise({ frequency: 0.04, max: 1, min: -1, octaves: 8 });

   for (var x = 0; x < width; x ++) {
      for (var y = 0; y < height; y ++) {
         var tile = TILE.GRASS;
         var elevation = simplex.scaled2D(x, y);

         if (elevation < 0.4)
            tile = TILE.DIRT;
         if (elevation < 0.2)
            tile = TILE.SAND;
         if (elevation < 0)
            tile = TILE.WATER;

         tiles.push(tile);
      }
   }

   return tiles;
};

WorldController.remake = function() {
   return WorldController.getWorld().then((world) => {
      return world.update({
         tiles: WorldController.generate(world.width, world.height)
      });
   });
};

WorldController.create = function() {
   return World.create({
      _id: 1,
      width: 100,
      height: 100,
      tiles: WorldController.generate(100, 100)
   });
};

WorldController.getWorld = function() {
   return Promise.resolve(worldInMemory).then((world) => {
      return world || World.findById(1);
   }).then((world) => {
      return world || WorldController.create();
   }).then((world) => {
      worldInMemory = world;

      return world;
   });
};

module.exports = WorldController;
