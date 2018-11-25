// Load modules
var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var fs      = require("fs");

// Show HTML
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

// Game setup
var game     = JSON.parse(fs.readFileSync("vars/exampleGame.json"));
var intervalTime = game.config.intervalTime;
var gameId   = setInterval(() => {updateGame()}, intervalTime);
setInterval(() => {sendGame()}, intervalTime);
setInterval(() => {tryTrash()}, 100);
setInterval(() => {tryPowerUp()}, 1500);
const skins = ["real1","real2","real3","real4"];
var names = ["Roomba","Bissell ","Miele","Shark","Dirt Devil","Miele","Hoover","Dyson","Niceeshop ","Oreck","Biene"].sort(() => {return .5 - Math.random();});
var nameI = 0;
var leftSkins = [];
fillLeftSkins();


// When a player connects
io.on('connection', (socket) => {
  // Send current state to client
  for(var trashId   in game.trashes)  socket.emit('trashCreated', game.trashes[trashId]);
  for(var playerId  in game.players)  socket.emit('playerConnect', game.players[playerId]);
  for(var powerUpId in game.powerUps) socket.emit('powerUpCreated', game.powerUps[powerUpId]);
  
  // Setup player
  game.players[socket.id] = JSON.parse(fs.readFileSync("vars/defaultPlayer.json"));

  var player = game.players[socket.id];
  player.id  = socket.id;
  if(leftSkins.length == 0) fillLeftSkins();
  player.type = leftSkins.pop();
  player.name = names[nameI]; nameI = (nameI+1) % names.length;
  player.x   = Math.floor(Math.random()*(game.map.width - game.vacuumTypes[player.type].radius));
  player.y   = Math.floor(Math.random()*(game.map.height - game.vacuumTypes[player.type].radius));
  player.points = 0
  // Send to others that i exist
  io.emit('playerConnect', player);
  // Recive info from the controller
  socket.on('disconnect', ()       => { io.emit('playerDisconnect', player);
                                        leftSkins.push(player.type);
                                        delete game.players[player.id] });
  socket.on('changeVacuum', (type) => { player.type = type; });
  socket.on('rename', (name)       => { player.name = name; });
  socket.on('move',   (isMoving)   => { player.isMoving = isMoving; });
  socket.on('active', (isActing)   => { player.isActing = isActing; });
});

function sendGame(){
  io.emit('playersUpdate', game.players);
}

function fillLeftSkins() {
  for (var skin of skins) leftSkins.push(skin);
}

function tryPowerUp(){
  if(Math.random() < 0.3) {
    if(Math.random() < 0.5) addPowerUp("turbo", 90);
    else addPowerUp("misil", 1);
  }
}

function tryTrash(){
  if(Math.random() < 0.09) {
    repopulateTrash();
  }
}
function repopulateTrash() {    
  if(Object.keys(game.trashes).length < game.config.maxTrash) addTrash('paper');
}
function addTrash(type) {  
  /*
  TODO: La trash es random pero es pot superposar a un jugador
  */
    var newTrash = {
      "id": (new Date()).getTime() + '' + Object.keys(game.trashes).length,
      "x": Math.floor(Math.random()*(game.map.width - game.trashTypes[type].sizeX/2)),
      "y": Math.floor(Math.random()*(game.map.height - game.trashTypes[type].sizeY/2)),
      "type": type
    };

    game.trashes[newTrash.id] = newTrash;    
    io.emit('trashCreated', newTrash);
    // console.log("Added trash", newTrash);
}
function addPowerUp(type, uses) { //Adds a power up to Power up vectors
  if(Object.keys(game.powerUps).length < 3){
    var newPowerUp = {
      "id": (new Date()).getTime() + '' + Object.keys(game.powerUps).length,
      "x": Math.floor(Math.random()*(game.map.width - game.powerUpTypes[type].sizeX/2)),
      "y": Math.floor(Math.random()*(game.map.height - game.powerUpTypes[type].sizeY/2)),
      "type": type,
      "uses": uses
    };
    game.powerUps[newPowerUp.id] = newPowerUp;
    io.emit('powerUpCreated', newPowerUp);
  }
}

function resetStats(player){ //Resets stats of mutipliers
  player.angularVelocity = 1;
  player.linearVelocity = 1;
  player.size = 1;
}

function updatePowerUpUses(player){ //If the power up is empty, it erases it from user.
  if(player.powerUpUsesLeft <= 0){
    player.powerUp = null;
    player.powerUpUsesLeft = 0;
    resetStats(player);
  } else player.powerUpUsesLeft -= 1;
}


function executePowerUp(player) {
  if (player.powerUp != null) {
    switch (player.powerUp) {
      case "turbo":
      player.angularVelocity = 2;
      player.linearVelocity = 3;
      console.log(player.powerUpUsesLeft);
      updatePowerUpUses(player);
        break;
      
      case "misil":
        shootMisil();
        updatePowerUpUses(player);
        break;
    }
  }
}

function checkActions() {
  for(var playerId in game.players) {
    var player = game.players[playerId];
    if (player.isActing){
      executePowerUp(player);
    } else resetStats(player);
  }
}

function updateGame(){
  for(var playerId in game.players) {
    var player = game.players[playerId];
    if (player.state == "colliding") {
      movePlayer(player);
      player.penalitzation -= 1;
      if (player.penalitzation < 0) player.state = "alive";
    }
    else if (player.state == "alive") {
      if (player.isMoving) movePlayer(player);
      else rotatePlayer(player);
    }
  }

  checkCollisionsPlayers();
  checkCollisionsTrahses();
  checkCollisionsPowerUps();
  checkActions();
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

function setPlayersColliding(player1, player2) {
  player1.state = "colliding";
  player1.penalitzation = game.states[player1.state].penalitzation;
  player2.state = "colliding";
  player2.penalitzation = game.states[player2.state].penalitzation;
  reverseMovePlayer(player1);
  reverseMovePlayer(player2);
  var angle = Math.atan((player1.y - player2.y)/(player1.x - player2.x))*360/(2*Math.PI);
  player1.angle = angle;
  player2.angle = 180 - angle;
}

function checkCollisionsPlayers() {
  for(var playerId1 in game.players) {
    var player1 = game.players[playerId1]
    for(var playerId2 in game.players) {
      if (playerId1 != playerId2) {
        var player2 = game.players[playerId2];
        if (playerPlayerCollision(player1,player2) && (player1.state != "colliding" && player2.state != "colliding")) {
          setPlayersColliding(player1,player2);
        }
      }
    }
    playerWallCollision(player1)

  }
}

function checkCollisionsTrahses() {
  for(var playerId in game.players) {
    var player = game.players[playerId];
    for(var trashId in game.trashes) {
      var trash = game.trashes[trashId];
      if (playerTrashOrPowerUpCollision(player,trash)) {
        player.points += 1;
        io.emit("trashDeleted",trash);
        delete game.trashes[trashId];
        player.points += game.trashTypes[trash.type].points;
        sendPuntuation();
        // console.log("Deleted Trash", trash);
      }
    }
  }
}

function checkCollisionsPowerUps() {
  for(var playerId in game.players) {
    var player = game.players[playerId];
    for(var powerUpId in game.powerUps) {
      var powerUp = game.powerUps[powerUpId];
      if (playerTrashOrPowerUpCollision(player,powerUp)) {
        givePowerUp(player, powerUp);
        io.emit('deletedPowerUp', powerUp);
        delete game.powerUps[powerUpId];
        console.log("Deleted PowerUp", powerUp);
      }
    }
  }
}
  
function playerCollidesTop(player)   { return game.vacuumTypes[player.type].radius > player.y }
function playerCollidesBottom(player){ return game.vacuumTypes[player.type].radius - 15 > game.map.height - player.y }
function playerCollidesLeft(player)  { return game.vacuumTypes[player.type].radius > player.x }
function playerCollidesRight(player) { return game.vacuumTypes[player.type].radius - 15  > game.map.width - player.x }

function playerWallCollision(player) {
  if (playerCollidesTop(player)) {
    player.angle = - player.angle;
    player.y += 10;
  } else if (playerCollidesBottom(player)) {
    player.angle = - player.angle;
    player.y -= 10;
  } else if (playerCollidesLeft(player)) {
    player.angle = 180 - player.angle;
    player.x += 10;
  } else if (playerCollidesRight(player)) {
    player.angle = 180 - player.angle;
    player.x -= 10;
  }
}

function givePowerUp(player, powerUp){
  player.powerUp = powerUp.type;
  player.powerUpUsesLeft = powerUp.uses;

}


function euclideanDist(x1,y1,x2,y2) {
  return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
}

function pointInCircle(xC,yC,rC,xP,yP) {
  return((xP-xC)*(xP-xC) + (yP-yC)*(yP-yC) <= rC*rC)
}


function playerPlayerCollision(player1,player2) {

  return (euclideanDist(player1.x,player1.y,player2.x,player2.y) <= 2*(game.vacuumTypes[player1.type].radius));
}

function playerTrashOrPowerUpCollision(player,object) {  
  var type = (game.trashTypes[object.type] != undefined) ? game.trashTypes[object.type] : game.powerUpTypes[object.type];
  var moveX = type.sizeX/2;
  var moveY = type.sizeY/2;
  return( pointInCircle(player.x,player.y,game.vacuumTypes[player.type].radius, object.x + moveX, object.y + moveY) ||
          pointInCircle(player.x,player.y,game.vacuumTypes[player.type].radius, object.x + moveX, object.y - moveY) ||
          pointInCircle(player.x,player.y,game.vacuumTypes[player.type].radius, object.x - moveX, object.y + moveY) ||
          pointInCircle(player.x,player.y,game.vacuumTypes[player.type].radius, object.x - moveX, object.y - moveY)
    );
}

function sendPuntuation() {
  puntuation = [];
  for (var playerId in game.players) {
    puntuation.push({
      "player": game.players[playerId].name,
      "points": game.players[playerId].points
    });
  }
  puntuation.sort((a,b) => { return a.points - b.points;});
  io.emit('points', puntuation);
}