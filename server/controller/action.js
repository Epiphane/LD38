'use strict';

(function() {

   var ActionController = {};

   ActionController.init = function(TILE) {

      ActionController.available = function(world, x, y, inventory) {
         var index = x + y * world.width;
         var inventory = inventory;
         var currentTile = world.tiles[index];

         var actions = [];
         switch (currentTile) {
         case TILE.GRASS:
                                                      actions.push('dig_grass');
            if (inventory.hasItem('seed_tree'))     { actions.push('plant_tree'); }
            break;
         
         case TILE.SOIL:
                                                      actions.push('water_soil');
            if (inventory.hasItem('seed_wheat'))    { actions.push('plant_wheat'); }
            if (inventory.hasItem('seed_sapling'))  { actions.push('plant_sapling'); }
         case TILE.DIRT:
                                                      // actions.push('dig_dirt');
            if (!currentTile === TILE.SOIL)         { actions.push('plow_dirt'); }
            break;

         case TILE.SAND:
            actions.push('dig_sand');
            break;
         
         case TILE.WATER:
            actions.push('shore_up');
            break;
         }

         return actions;
      };

      // This will "Gracefully" ensure that you only do actions at the right time
      ActionController.assert = function(assertion, message) {
         if (!assertion)
            throw new Error('Assertion failed: ' + (message || ''));
      };

      ActionController.setTile = function(world, index, tile) {
         return world.setTile(index, tile).then((result) => result);
      };

      ActionController.dig_grass = function(world, index, inventory) {
         ActionController.assert(world.tiles[index] === TILE.GRASS, 'dig_grass must be on grass');

         return ActionController.setTile(world, index, TILE.DIRT);
      };

      ActionController.dig_dirt = function(world, index, inventory) {
         ActionController.assert(world.tiles[index] === TILE.DIRT, 'dig_dirt must be on dirt');

         return ActionController.setTile(world, index, TILE.DIRT);
      };

      ActionController.dig_sand = function(world, index, inventory) {
         ActionController.assert(world.tiles[index] === TILE.SAND, 'dig_sand must be on sand');

         return ActionController.setTile(world, index, TILE.WATER);
      };

      ActionController.shore_up = function(world, index, inventory) {
         ActionController.assert(world.tiles[index] === TILE.WATER, 'shore_up must be on water');

         return ActionController.setTile(world, index, TILE.SAND);
      };

      ActionController.plow_dirt = function(world, index, inventory) {
         ActionController.assert(world.tiles[index] === TILE.DIRT, 'plow_dirt must be on dirt');

         return ActionController.setTile(world, index, TILE.SOIL);
      };

      ActionController.action = function(world, index, action, inventory) {
         var x = index % world.width;
         var y = Math.floor(index / world.width);
         var availableActions = ActionController.available(world, x, y, inventory);

         if (availableActions.indexOf(action) < 0) {
            return { executed: false, reason: 'Action ' + action + ' not available.' };
         }
         else if (!ActionController.hasOwnProperty(action)) {
            return { executed: false, reason: 'ActionController.' + action + ' does not exist.' };
         }
         else {
            return ActionController[action](world, index, inventory).then((updates) => {
               return { executed: true, updates: updates };
            }).catch((e) => {
               return { executed: false, reason: e.message };
            });
         }
      };

      return ActionController;
   };

   // web AND server woahh
   if (typeof(exports) === 'object') {
      module.exports = ActionController.init(require('../tiles'));
   }
   else {
      define(['constants/tiles'], function(TILE) { return ActionController.init(TILE); });
   }

})();