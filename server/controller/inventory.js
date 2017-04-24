'use strict';

(function() {
   // This object is imported both server- and client-side.
   // This means any functionality you add here is reflected on both (w00t)

   var Inventory = function() {
      this.items = {};
   };

   Inventory.prototype.addItem = function(key, count) {
      count = count || 1;

      this.items[key] = this.items[key] || 0;
      this.items[key] += count;
   };

   Inventory.prototype.hasItem = function(key) {
      return this.items.hasOwnProperty(key) && this.items[key] > 0;
   };

   // web AND server woahh
   if (typeof(exports) === 'object') {
      module.exports = Inventory;
   }
   else {
      define([], function() { return Inventory; });
   }

})();