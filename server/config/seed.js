/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var sqldb = require('../sqldb');
var fs = require('fs');

var SeedData = require('./seed_data');

var GameController = require('../controller/game');

var Game        = sqldb.Game;
var Character   = sqldb.Character;
var Action      = sqldb.Action;
var Ability     = sqldb.Ability;
var Enemy       = sqldb.Enemy;
var Item        = sqldb.Item;
var Realm       = sqldb.Realm;
var Location    = sqldb.Location;

var modelsSmallToLarge = [Game, Character, Action, Location, Realm, Enemy, Ability];
var modelsLargeToSmall = [Enemy, Realm, Location, Game, Character, Action, Ability];

module.exports = function() {
   return (function(dbSync) {
      return dbSync().then(function() {
         console.log('Creating Actions...');

         return Action.bulkCreate(SeedData.actions);
      }).then(function(actions) {
         console.log('Creating Items and Enemies...');

         var tasks = [];

         SeedData.enemies.forEach(function(enemyData) {
            tasks.push(
               Enemy.create(enemyData).then(function(enemy) {
                  return enemy.addActions(actions.filter(function(action) {
                     return enemyData.actions.indexOf(action.getDataValue('name')) >= 0;
                  }));
               })
            );
         });

         SeedData.items.forEach(function(itemData) {
            tasks.push(
               Item.create(itemData).then(function(item) {
                  return item.addActions(actions.filter(function(action) {
                     return itemData.actions.indexOf(action.getDataValue('name')) >= 0;
                  }));
               })
            );
         });

         return Promise.all(tasks);
      }).then(function() {

         function createRealm(realmInfo) {
            console.log('Creating ' + realmInfo.name + '...');
            return Realm.create({
               name: realmInfo.name
            }).then(function(realm) {
               console.log('Creating ' + realmInfo.name + ' locations...');
               realmInfo.locations.forEach(function(location) {
                  // Convert layout from [...] to {...}
                  location.layout = (location.layout || []).map(function(element) {
                     if (element instanceof Array) {
                        // element = {
                        //    type: element[0],
                        //    text: element[1],
                        //    action: element[2],
                        //    effect: element[3]
                        // };
                     }

                     return element;
                  })
               });

               return Location.bulkCreate(realmInfo.locations).then(function(locations) {
                  console.log('Linking ' + realmInfo.name + ' locations...');
                  return realm.addLocations(locations);
               });
            });
         }

         function createNextRealm(index) {
            if (index >= SeedData.realms.length) {
               return;
            }
            else {
               return createRealm(SeedData.realms[index])
                  .then(function() {
                     return createNextRealm(index + 1);
                  });
            }
         }

         return createNextRealm(0);
      }).then(function() {
         console.log('Creating global game [JAM]...');

         return GameController.findOrCreate('global');
      }).then(function() {
         console.log('Seed complete!');
      });
   })(function() {
      function performAll(command, models, args) {
         var _models = [];
         for (var i = 0; i < models.length; i ++) _models.push(models[i]);
         models = _models;

         var model = models.shift();
         args = Array.prototype.slice.call(arguments, 2);

         console.log('Performing ' + command + ' on ' + model);
         var promise = model[command].apply(model, args);
         while (models.length > 0) {
            promise = (function(model) {
               return promise.then(function() {
                  console.log('Performing ' + command + ' on ' + model);
                  return model[command].apply(model, args);
               })
            })(models.shift());
         }

         return promise;
      }

      console.log('Dropping all tables...');
      return sqldb.sequelize.drop({ cascade: true }).then(function() {
         console.log('Syncing tables...');
         return sqldb.sequelize.sync({ force: true });
         // return performAll('sync', modelsLargeToSmall, { force: true })
      }).then(function() {
         return performAll('destroy', modelsSmallToLarge, { where: {} });
      });
   });
};