'use strict';

var Promise = require('promise');
var sqldb = require('../sqldb');
var Realm = sqldb.Realm;

var gamesInMemory = {};

var GameController = module.exports = function() {};

GameController.emptyFunction = function(game) {
   // Do something with the "game"
};

module.exports = GameController;
