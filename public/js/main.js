requirejs.config({
   baseUrl: 'js',
   paths: {
   }
});

require([
   'connection_manager',
   'content_manager',
   'screens/game'
], function(
   ConnectionManager,
   ContentManager,
   GameScreen
) {
   window.GAME_WIDTH = 800;
   window.GAME_HEIGHT = 800;

   Juicy.Game.init(document.getElementById('game-canvas'), GAME_WIDTH, GAME_HEIGHT, {
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      SPACE: 32,

      W: 87,
      A: 65,
      S: 83,
      D: 68,
   });

   document.getElementById('game-canvas').getContext('2d').imageSmoothingEnabled = false;

   window.onmousewheel = function(e) {
      Juicy.Game.trigger('mousewheel', e);
   }

   // On window resize, fill it with the game again!
   window.onresize = function() {
      Juicy.Game.resize();
   };

   // Initialize connection to server
   var connection = new ConnectionManager();

   var disconnect = $('#disconnect');
   connection.on('disconnect', function() {
      disconnect.show();
   });
   connection.on('reconnect', function() {
      disconnect.hide();
   });

   Juicy.Game.setState(new GameScreen(connection)).run();
})
