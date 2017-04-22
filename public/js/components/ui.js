define([
   'constants/tiles',
   'helpers/terrain',
   'helpers/atlas'
], function(
   TILE,
   TerrainHelper,
   TerrainAtlas
) {
   return Juicy.Component.create('UI', {
      render: function(context) {
         context.fillStyle = this.entity.action === 0 ? 'red' : 'white';
         context.font = '36px Pixellari, monospace';
         context.fillText('Grass', 80, 50);
         TerrainHelper.drawOffset(context, 20, 20, TerrainAtlas.offsets.GRASS_1);

         context.fillStyle = this.entity.action === 1 ? 'red' : 'white';
         context.font = '36px Pixellari, monospace';
         context.fillText('Water', 80, 100);
         TerrainHelper.drawOffset(context, 20, 70, TerrainAtlas.offsets.WATER_BUSY_1);
      },

      click: function(point) {
         if (point.y < 50) this.entity.action = 0;
         else this.entity.action = 1;
      }
   });
});
