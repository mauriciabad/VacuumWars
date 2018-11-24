var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/controller/index.html');
});

http.listen(3000, function(){
  console.log('listening on localhot:3000');
});

var game = {};
var gameId = setInterval(updateGame(), 1000/60);
var sockets = {};

io.on('connection', function(socket){
  var player = '';

  console.log('Connected user: ' + socket.id);

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('rename', function(name){
    console.log(name);
  });

  socket.on('move', function(isMoving){
    if(isMoving) console.log("Socket Move");
    else console.log("Stopped Moving");
  });

  socket.on('active', function(isActing){  
    if(isActing) console.log("Socket Active"); 
    else console.log("Socket not acting"); 
  });
});


/*
Aqui escriu el Mauri

*/




/*
Aqui escriu l'Alvaro
*/

function repopulateTrash() {
  if(game.trashes.length < game.config.minTrash){
    addTrash(game.config.minTrash - game.trashes.length);
  }
}

function addPowerUp() {
  var randx = Math.random();
  var randy = Math.random();
  randx = randx*game.map.width;
  randy = randy*game.map.height;
  var json = {"x": randx, "y": randy, "type":"turbo"}
  game.powerUps.push(json);
}

function repopulatePowerUp() {
  var prob = Math.random();
  if(prob > 0.95) addPowerUp();
}

function executePowerUp(player, duration) {
  var powerUp = player.powerUp;
  if(duration > 0){ //Si el powerup encara dura.
    switch (powerUp) {
      case "turbo":
        player.angularVelocity = 1.5;
        player.linearVelocity = 1.5;
        player.usesLeft -= 1;
        break;
    
      default:
        break;
    }
  }
}

function checkActions() {
  for (const playerId in game.players) {
    var player = game.players[playerId];
    if (player.isActing) executePowerUp(player); //Mirar si no es null
  }
}

function updateGame(){
  for (const playerId in game.players) {
    var player = game.players[playerId];
    if (palyer.isMoving) movePlayer(player);
    else rotatePlayer(player);
  }

  checkCollisionsPlayers();
  checkCollisionsTrash();
  checkCollisionsPowerUp();
  checkActions();
  repopulatePowerUp();
  repopulateTrash();
  //respawn
}

/*
Aqui escriu el Carles
*/




