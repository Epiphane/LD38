var Promise    = require('promise');
var express    = require('express');

module.exports = function(db, auth) {
   var app       = new express();
   
   var Realm     = db.Realm;

   app.get('/', function(req, res) {
      Realm.findAll({ where: {} }).then(function(realms) {
         res.json(realms);
      });
   });

   return app;
}
