// Load modules
var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var fs   = require("fs");

// Show HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/controller/index.html');
});

http.listen(3000, () => {
  console.log('listening on localhot:3000');
});

// The game
var game   = JSON.parse(fs.readFileSync("vars/exampleGame.json"));
var gameId = setInterval(() => {updateGame()}, 1000/60);
setInterval(() => {sendGame()}, 1000/60);

// When a player connects
io.on('connection', (socket) => {
  game.players[socket.id] = JSON.parse(fs.readFileSync("vars/defaultPlayer.json"));

  let player = game.players[socket.id];

  socket.on('disconnect', ()       => { delete game.players[socket.id] });
  socket.on('changeVacuum', (type) => { player.type = type; });
  socket.on('rename', (name)       => { player.name = name; });
  socket.on('move',   (isMoving)   => { player.isMoving = isMoving; });
  socket.on('active', (isActing)   => { player.isActing = isActing; });
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




