define([
   'constants/tiles',
   'helpers/terrain',
   'helpers/atlas'
], function(
   TILE,
   TerrainHelper,
   TerrainAtlas
) {
   var Icons = new Image();
       Icons.src = './images/ui_icons.png';

   var actions = [
      { id: 'dig_grass', text: 'Dig',      icon: [0, 0] },
      { id: 'dig_dirt',  text: 'Dig',      icon: [1, 0] },
      { id: 'dig_sand',  text: 'Dig',      icon: [2, 0] },
      { id: 'shore_up',  text: 'Shore Up', icon: [2, 1] },
      { id: 'plow_dirt', text: 'Plow',     icon: [3, 0] },
   ];
   var actionMap = {};
   actions.forEach((action) => actionMap[action.id] = action);

   return Juicy.Component.create('UI', {
      constructor: function() {
         this.actions = [];
      },

      update: function(dt, game) {
         var x = this.entity.state.mainChar.getComponent('Character').targetTileX;
         var y = this.entity.state.mainChar.getComponent('Character').targetTileY;
         var index = x + y * this.entity.state.world.width;

         var currentTile = this.entity.state.world.tiles[index];

         this.actions = [];
         switch (currentTile) {
         case TILE.GRASS:
            this.actions.push(actionMap.dig_grass);
            break;
         case TILE.DIRT:
            this.actions.push(actionMap.dig_dirt);
            this.actions.push(actionMap.plow_dirt);
            break;
         case TILE.SAND:
            this.actions.push(actionMap.dig_sand);
            break;
         case TILE.WATER:
            this.actions.push(actionMap.shore_up);
            break;
         }
      },

      render: function(context) {
         context.fillStyle = 'white';

         var currentAction = this.entity.action;
         this.actions.forEach(function(action, index) {
            context.font = '16px Pixellari, monospace';
            context.fillText((index + 1) + '.', 7, (index + 1) * 50 - 6);

            context.fillStyle = currentAction === action.id ? 'red' : 'white';

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
            this.entity.state.action(this.actions[keyCode].id);
         }
      },

      click: function(point) {
         if (point.y < 0 || point.y > this.actions.length * 50)
            return;

         var index = Math.floor(point.y / 50);
         this.entity.state.action(this.actions[index].id);
      }
   });
});
