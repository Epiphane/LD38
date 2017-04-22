define([
   'constants/tiles',
   'helpers/terrain',
   'helpers/atlas'
], function(
   TILE,
   TerrainHelper,
   TerrainAtlas
) {
   var actions = [
      { name: 'Grass', tile: TerrainAtlas.offsets.GRASS_UI },
      { name: 'Water', tile: TerrainAtlas.offsets.WATER_UI },
      { name: 'Sand', tile: TerrainAtlas.offsets.SAND_UI },
   ];

   return Juicy.Component.create('UI', {
      render: function(context) {
         context.fillStyle = 'white';

         var currentAction = this.entity.action;
         actions.forEach(function(action, index) {
            context.fillStyle = currentAction === index ? 'red' : 'white';

            context.font = '36px Pixellari, monospace';
            context.fillText(action.name, 80, (index + 1) * 50);
            TerrainHelper.drawOffset(context, 20, index * 50 + 20, action.tile);
         });
      },

      click: function(point) {
         if (point.y < 0 || point.y > actions.length * 50)
            return;

         this.entity.action = Math.floor(point.y / 50);
      }
   });
});
