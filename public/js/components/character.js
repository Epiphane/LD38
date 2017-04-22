define([
], function(
) {
   return Juicy.Component.create('Character', {
      x: 0,
      y: 0,

      render: function(context) {
         context.fillStyle = 'blue';
         context.fillRect(this.x, this.y, 10, 10);
      },
   });
});
