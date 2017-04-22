'use strict';

var Promise = require('promise');
var sqldb = require('../sqldb');
var World = sqldb.World;

var WorldController = module.exports = function() {};

WorldController.generate = function() {
   var tiles = [];

   for (var i = 0; i < 10000; i ++) {
      tiles.push(Math.round(Math.random()));
   }

   return World.build({
      tiles: tiles
   });
};

module.exports = WorldController;
