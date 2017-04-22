'use strict';

var Promise = require('promise');
var sqldb = require('../sqldb');
var World = sqldb.World;

var worldInMemory = null;
var WorldController = module.exports = function() {};

WorldController.generate = function() {
   var tiles = [];

   for (var i = 0; i < 10000; i ++) {
      tiles.push(Math.round(Math.random()));
   }

   return World.create({
      _id: 1,
      tiles: tiles
   });
};

WorldController.getWorld = function() {
   return Promise.resolve(worldInMemory).then((world) => {
      return world || World.findById(1);
   }).then((world) => {
      if (!world) {
         world = WorldController.generate();

         return world.save();
      }

      return world;
   }).then((world) => {
      worldInMemory = world;

      return world;
   });
};

WorldController.activate = function(index) {
   return WorldController.getWorld().then((world) => {      
      var value = (world.tiles[index] + 1) % 8;
      world.tiles[index] = value;

      return sqldb.sequelize.query('UPDATE worlds SET tiles[?] = ? WHERE _id = ?', {
         replacements: [index, value, world._id]
      }).then(() => {
         return value;
      })
   })
};

module.exports = WorldController;
