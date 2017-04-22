'use strict';

var Promise = require('promise');
var sqldb = require('../sqldb');
var World = sqldb.World;

var FastSimplexNoise = require('fast-simplex-noise').default;

var worldInMemory = null;
var WorldController = module.exports = function() {};

WorldController.generate = function(width, height) {
   var tiles = [];
   var simplex = new FastSimplexNoise({ frequency: 0.02, max: 1, min: -1, octaves: 8 });

   for (var x = 0; x < width; x ++) {
      for (var y = 0; y < height; y ++) {
         var tile = 0;
         var elevation = simplex.scaled2D(x, y);

         if (elevation < 0)
            tile = 1;

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

WorldController.activate = function(index) {
   return WorldController.getWorld().then((world) => {      
      var value = (world.tiles[index] + 1) % 2;
      world.tiles[index] = value;

      sqldb.sequelize.query('UPDATE worlds SET tiles[?] = ? WHERE _id = ?', {
         replacements: [index, value, world._id]
      }).then(() => {
      })
      return value;
   })
};

module.exports = WorldController;
