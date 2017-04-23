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

WorldController.setTile = function(world, index, value) {
   if (world.tiles[index] === value)
      return [index, value];

   world.tiles[index] = value;

   // Don't wait on the query
   sqldb.sequelize.query('UPDATE worlds SET tiles[?] = ? WHERE _id = ?', {
      replacements: [index, value, world._id]
   });
   return [index, value];
};

// This will "Gracefully" ensure that you only do actions at the right time
WorldController.assert = function(assertion, message) {
   if (!assertion)
      throw new Error('Assertion failed: ' + (message || ''));
};

WorldController.dig_grass = function(world, index) {
   WorldController.assert(world.tiles[index] === TILE.GRASS, 'dig_grass must be on grass');

   return [WorldController.setTile(world, index, TILE.DIRT)];
};

WorldController.dig_dirt = function(world, index) {
   WorldController.assert(world.tiles[index] === TILE.DIRT, 'dig_dirt must be on dirt');

   return [WorldController.setTile(world, index, TILE.DIRT)];
};

WorldController.dig_sand = function(world, index) {
   WorldController.assert(world.tiles[index] === TILE.SAND, 'dig_sand must be on sand');

   return [WorldController.setTile(world, index, TILE.WATER)];
};

WorldController.shore_up = function(world, index) {
   WorldController.assert(world.tiles[index] === TILE.WATER, 'shore_up must be on water');

   return [WorldController.setTile(world, index, TILE.SAND)];
};

WorldController.plow_dirt = function(world, index) {
   WorldController.assert(world.tiles[index] === TILE.DIRT, 'plow_dirt must be on dirt');

   return [WorldController.setTile(world, index, TILE.SOIL)];
};

WorldController.action = function(index, action) {
   return WorldController.getWorld().then((world) => {
      if (WorldController[action]) {
         return WorldController[action](world, index);
      }
      else {
         return [];
      }
   }).catch((e) => {
      console.error('Error:', e);

      // TODO some sort of "revert" update
      return [];
   });
};

module.exports = WorldController;
