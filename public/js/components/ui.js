define([
   'constants/tiles',
   'helpers/terrain',
   'helpers/atlas',
   'controller/action'
], function(
   TILE,
   TerrainHelper,
   TerrainAtlas,
   ActionController
) {
   var Icons = new Image();
       Icons.src = './images/ui_icons.png';

   var actions = {
      'dig_grass':      { text: 'Dig',      icon: [0, 0] },
      'dig_dirt':       { text: 'Dig',      icon: [1, 0] },
      'dig_sand':       { text: 'Dig',      icon: [2, 0] },
      'shore_up_dirt':  { text: 'Shore Up', icon: [3, 1] },
      'shore_up_sand':  { text: 'Shore Up', icon: [2, 1] },
      'plow_dirt':      { text: 'Plow',     icon: [3, 0] },
      'water_soil':     { text: 'Water',    icon: [6, 2] },
      'plant_wheat':    { text: 'Plant',    icon: [2, 2] },
      'plant_sapling':  { text: 'Plant',    icon: [0, 2] },
      'plant_tree':     { text: 'Plant',    icon: [1, 2] },
      'grow_wheat':     { text: 'Grow',     icon: [6, 2] },
      'harvest_wheat':  { text: 'Harvest',  icon: [2, 2] },
      'chop_tree':      { text: 'Chop',     icon: [3, 3] }
   };

   return Juicy.Component.create('UI', {
      constructor: function() {
         this.actions = [];
      },

      update: function(dt, game) {
         if (!this.entity.state.world.ready)
            return;

         var x = this.entity.state.mainChar.getComponent('Character').targetTileX;
         var y = this.entity.state.mainChar.getComponent('Character').targetTileY;

         this.actions = ActionController.available(this.entity.state.world, x, y, this.entity.state.inventory);
      },

      render: function(context) {
         context.fillStyle = 'white';

         var currentAction = this.entity.action;
         this.actions.forEach(function(action_id, index) {
            var action = actions[action_id];

            context.font = '16px Pixellari, monospace';
            context.fillText((index + 1) + '.', 7, (index + 1) * 50 - 6);

            context.fillStyle = currentAction === action_id ? 'red' : 'white';

            context.font = '32px Pixellari, monospace';
            context.fillText(action.text, 70, (index + 1) * 50);

            var sx = action.icon[0] * TerrainHelper.tilesize;
            var sy = action.icon[1] * TerrainHelper.tilesize;
            context.drawImage(Icons, sx, sy, TerrainHelper.tilesize, TerrainHelper.tilesize,
               30, index * 50 + 23, TerrainHelper.tilesize, TerrainHelper.tilesize);
         });
      },

      keypress: function(keyCode) {
         // Clamp to 0-9
         keyCode -= 48;
         if (keyCode === 0) keyCode = 10;
         keyCode --;

         if (keyCode < this.actions.length) {
            this.entity.state.action(this.actions[keyCode]);
         }
      },

      click: function(point) {
         if (point.y < 0 || point.y > this.actions.length * 50)
            return;

         var index = Math.floor(point.y / 50);
         this.entity.state.action(this.actions[index]);
      }
   });
});
