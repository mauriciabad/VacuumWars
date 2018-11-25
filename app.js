// Load modules
var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var fs      = require("fs");

// Show HTML
app.use(express.static('public'));
http.listen(3000, () => {
  console.log('listening on localhost:3000');
});

// Game setup
var game     = JSON.parse(fs.readFileSync("vars/exampleGame.json"));
var intervalTime = 1000/60;
var gameId   = setInterval(() => {updateGame()}, intervalTime);
setInterval(() => {sendGame()}, intervalTime);
setInterval(() => {tryTrash()}, intervalTime/7);

function tryTrash(){
  if(Math.random() < 0.005) {
    repopulateTrash();
  }
}


// When a player connects
io.on('connection', (socket) => {
  game.players[socket.id] = JSON.parse(fs.readFileSync("vars/defaultPlayer.json"));

  var player = game.players[socket.id];
  player.id  = socket.id;
  player.x   = Math.floor(Math.random()*(game.map.width - game.vacuumTypes[player.type].radius));
  player.y   = Math.floor(Math.random()*(game.map.height - game.vacuumTypes[player.type].radius));

  io.emit('playerConnect', player);
  for (var i = 0; i < game.trashes.length; ++i) {
    socket.emit('trashCreated', game.trashes[i])
  }
  socket.on('disconnect', ()       => { io.emit('playerDisconnect', player);
                                        delete game.players[player.id] });
  socket.on('changeVacuum', (type) => { player.type = type; });
  socket.on('rename', (name)       => { player.name = name; });
  socket.on('move',   (isMoving)   => { player.isMoving = isMoving; });
  socket.on('active', (isActing)   => { player.isActing = isActing; });
});

/*
Aqui escriu el Mauri

*/

function sendGame(){
  io.emit('playersUpdate', game.players);
}


/*
Aqui escriu l'Alvaro
*/

function repopulateTrash() {
  if(game.trashes.length < game.config.maxTrash) addTrash('paper');
}

function addPowerUp(type) {
  var newPowerUp = {
    "x": Math.floor(Math.random()*(game.map.width - game.powerUpTypes[type].radius)),
    "y": Math.floor(Math.random()*(game.map.height - game.powerUpTypes[type].radius)),
    "type": type
  };
  game.powerUps.push(newPowerUp);
}

function executePowerUp(player) {
  if (player.powerUp != null) {
    if(player.powerUpUsesLeft > 0){
      switch (player.powerUp) {
        case "turbo":
          player.angularVelocity = 1.5;
          player.linearVelocity = 1.5;
          player.usesLeft -= 1;
          break;
      }
    }
  }
}

function checkActions() {
  for (const playerId in game.players) {
    var player = game.players[playerId];
    if (player.isActing) executePowerUp(player);
  }
}

function updateGame(){
  for (const playerId in game.players) {
    var player = game.players[playerId];
    if (player.isMoving) movePlayer(player);
    else rotatePlayer(player);
  }

  checkCollisionsPlayers();
  checkCollisionsTrahses();
  checkCollisionsPowerUps();
  checkActions();
  if(Math.random() < 0.05) addPowerUp('turbo');
  //respawn
}

function movePlayer(player) {
  var distance = game.vacuumTypes[player.type].linearVelocity*player.linearVelocity*intervalTime;
  player.x += Math.cos(player.angle*2*Math.PI/360)*distance;
  player.y += Math.sin(player.angle*2*Math.PI/360)*distance;
}

function reverseMovePlayer(player) {
  var distance = game.vacuumTypes[player.type].linearVelocity*player.linearVelocity*intervalTime;
  player.x -= Math.cos(player.angle*2*Math.PI/360)*distance;
  player.y -= Math.sin(player.angle*2*Math.PI/360)*distance;
}

function rotatePlayer(player) {
  player.angle += game.vacuumTypes[player.type].angularVelocity*player.angularVelocity*intervalTime;
  player.angle %= 360;
}

function addTrash(type) {  
  /*
  TODO: La trash es random pero es pot superposar a un jugador
  */
    var newTrash = {
      "x": Math.floor(Math.random()*(game.map.width - game.trashTypes[type].sizeX/2)),
      "y": Math.floor(Math.random()*(game.map.height - game.trashTypes[type].sizeY/2)),
      "type": type
    };

    game.trashes.push(newTrash);    
    io.emit('trashCreated', newTrash);
    console.log("Added trash", newTrash);
}

function checkCollisionsPlayers() {
  for(const playerId1 in game.players) {
    var player1 = game.players[playerId1]
    for(const playerId2 in game.players) {
      if (playerId1 != playerId2) {
        var player2 = game.players[playerId2]
        if (playerPlayerCollision(player1,player2)) {
          reverseMovePlayer(player1)
          reverseMovePlayer(player2)
        }
      }
    }
    if (playerWallCollision(player1)) {
      reverseMovePlayer(player1)
    }

  }
}

function checkCollisionsTrahses() {
  var broadcast = false
  for(const playerId in game.players) {
    var player = game.players[playerId];
    for(const trash in game.trashes) {
      if (playerTrashOrPowerUpCollision(player,trash)) {
        delete game.trashes[trash];
        broadcast = true
      }
    }
  }
  if (broadcast) {
    io.emit('trashes',game.trashes)
  }
}

function playerCollidesTop(player)   { return 20 > player.y }
function playerCollidesBottom(player){ return 20 > game.map.height - player.y }
function playerCollidesLeft(player)  { return 20 > player.x }
function playerCollidesRight(player) { return 20 > game.map.width - player.x }
function playerWallCollision(player) {
  return playerCollidesTop(player)  || playerCollidesBottom(player) ||
         playerCollidesLeft(player) || playerCollidesRight(player) ;
}

function checkCollisionsPowerUps() {
  for(const playerId in game.players) {
    var player = game.players[playerId];
    for(const powerUpId in game.powerUps) {
      var powerUp = game.powerUps[powerUpId];
      if (playerTrashOrPowerUpCollision(player,powerUp)) {
        givePowerUp(player, powerUp);
        delete game.powerUps[powerUpId];
      }
    }
  }
}

function euclideanDist(x1,y1,x2,y2) {
  return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
}

function pointInCircle(xC,yC,rC,xP,yP) {
  return((xP-xC)*(xP-xC) + (yP-yC)*(yP-yC) <= rC*rC)
}


function playerPlayerCollision(player1,player2) {
  /*
  TODO: posar be el radius pq esta harcodeado
  */
  return (euclideanDist(player1.x,player1.y,player2.x,player2.y) <= 2*(20))
}

function playerTrashOrPowerUpCollision(player,object) {
  var moveX = game.vacuumTypes[player.type].sizeX/2
  var moveY = game.vacuumTypes[player.type].sizeY/2
  return( pointInCircle(player.x,player.y,20, object.x + moveX, object.y + moveY) ||
          pointInCircle(player.x,player.y,20, object.x + moveX, object.y - moveY) ||
          pointInCircle(player.x,player.y,20, object.x - moveX, object.y + moveY) ||
          pointInCircle(player.x,player.y,20, object.x - moveX, object.y - moveY)
    );
}






