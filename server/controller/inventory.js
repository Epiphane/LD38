'use strict';

(function() {
   var Inventory = function() {
      this.items = { seed_wheat: 1};
   };

   Inventory.prototype.hasItem = function(key) {
      return this.items.hasOwnProperty(key) && this.items[key] > 0;
   }

   // web AND server woahh
   if (typeof(exports) === 'object') {
      module.exports = Inventory;
   }
   else {
      define([], function() { return Inventory; });
   }

})();