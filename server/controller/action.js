'use strict';

(function() {

   var ActionController = {};

   ActionController.init = function(TILE) {

      ActionController.getTile = function(world, x, y) {
         if (x < 0) x = 0;
         if (y < 0) y = 0;
         if (x >= world.width) x = world.width - 1;
         if (y >= world.width) y = world.width - 1;

         return world.tiles[x + y * world.width];
      }

      ActionController.available = function(world, x, y, inventory) {
         var inventory = inventory;
         var currentTile = ActionController.getTile(world, x, y);
         var above = ActionController.getTile(world, x, y - 1);
         var below = ActionController.getTile(world, x, y + 1);
         var left  = ActionController.getTile(world, x - 1, y);
         var right = ActionController.getTile(world, x + 1, y);

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
            break;
         case TILE.DIRT:
                                                      // actions.push('dig_dirt');
            if (currentTile === TILE.DIRT) {
               var acceptable = [TILE.SOIL, TILE.SOIL_WET, TILE.DIRT, TILE.GRASS];
               if (acceptable.indexOf(above) >= 0 && acceptable.indexOf(below) >= 0 && acceptable.indexOf(left) >= 0 && acceptable.indexOf(right) >= 0) {
                  actions.push('plow_dirt'); 
               }
            }
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

      ActionController.water_soil = function(world, index, inventory) {
         ActionController.assert(world.tiles[index] === TILE.SOIL, 'water_soil must be on soil');

         return ActionController.setTile(world, index, TILE.SOIL_WET);
      };

      ActionController.water_soil = function(world, index, inventory) {
         ActionController.assert(world.tiles[index] === TILE.SOIL, 'water_soil must be on soil');

         return ActionController.setTile(world, index, TILE.SOIL_WET);
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