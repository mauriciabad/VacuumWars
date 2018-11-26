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
setInterval(() => {repopulateTrash()}, 100);
setInterval(() => {repopulatePowerUp()}, 500);

const skins = ["real1","real2","real3","real4","real5","real6","real7","real8","real9","real10"].sort(() => {return .5 - Math.random();});
var skinI = 0;
var names = ["Roomba","Bissell ","Miele","Shark","Dirt Devil","Miele","Hoover","Dyson","Niceeshop ","Oreck","Biene"].sort(() => {return .5 - Math.random();});
var nameI = 0;
var trashFrecSum   = sumFrec(game.trashTypes);
var powerUpFrecSum = sumFrec(game.powerUpTypes);

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
  player.type = skins[skinI]; skinI = (skinI+1) % skins.length;
  player.name = names[nameI]; nameI = (nameI+1) % names.length;
  player.x    = Math.floor(Math.random()*(game.map.width - game.vacuumTypes[player.type].radius));
  player.y    = Math.floor(Math.random()*(game.map.height - game.vacuumTypes[player.type].radius));
  player.points = 0
  // Send to others that i exist
  io.emit('playerConnect', player);
  sendPuntuation();
  // Recive info from the controller
  socket.on('disconnect', ()       => { io.emit('playerDisconnect', player);
                                        delete game.players[player.id]
                                        sendPuntuation(); });
  socket.on('move',   (isMoving)   => { player.isMoving = isMoving; });
  socket.on('active', (isActing)   => { player.isActing = isActing; });
  socket.on('ignoreMe', (isIgnored)=> { io.emit('playerDisconnect', player);
                                        delete game.players[player.id]
                                        sendPuntuation(); });
});

function sendGame(){
  io.emit('playersUpdate', game.players);
  if (Object.keys(game.misils).length > 0){
    io.emit('misilsUpdate',game.misils);
  }
}

function sumFrec(types) {
  var sum = 0;
  for (var type in types) sum += types[type].frequency;
  return sum;
}

function getFrec(types, freq) {
  var sum = 0;
  for (var type in types){
    if(freq >= sum && freq < sum + types[type].frequency) return type;
    sum += types[type].frequency;
  }
}

function repopulatePowerUp(){
  if(Math.random() < 0.2 && Object.keys(game.powerUps).length < game.config.maxPowerUp) {
    var n = Math.floor(Math.random()*powerUpFrecSum);
    if(n == powerUpFrecSum) powerUpFrecSum - 0.001;
    addPowerUp(getFrec(game.powerUpTypes, n));
  }
}

function repopulateTrash() {    
  console.log(game);  
  if(Math.random() < 0.1 && Object.keys(game.trashes).length < game.config.maxTrash) {
    var n = Math.floor(Math.random()*trashFrecSum);
    if(n == powerUpFrecSum) powerUpFrecSum - 0.001;
    addTrash(getFrec(game.trashTypes, n));
  }
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
function addPowerUp(type) { //Adds a power up to Power up vectors
  if(Object.keys(game.powerUps).length < 3){
    var newPowerUp = {
      "id": (new Date()).getTime() + '' + Object.keys(game.powerUps).length,
      "x": Math.floor(Math.random()*(game.map.width - game.powerUpTypes[type].sizeX/2)),
      "y": Math.floor(Math.random()*(game.map.height - game.powerUpTypes[type].sizeY/2)),
      "type": type,
      "uses": game.powerUpTypes[type].uses
    };
    game.powerUps[newPowerUp.id] = newPowerUp;
    io.emit('powerUpCreated', newPowerUp);
  }
}

function resetStats(player){ //Resets stats of mutipliers
  player.angularVelocity = 1;
  player.size = 1;
  player.magnetic = false;
  if(player.wired == 0) player.linearVelocity = 1;
  else player.wired -= 1;
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
      updatePowerUpUses(player);
        break;
      
      case "misilOff":
        if (player.powerUpUsesLeft > 0) shootMisil(player);
        updatePowerUpUses(player);
        break;

      case "magnet":
        player.magnetic = true;
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
    if (player.magnetic) atractAllPapers(player);
    if (player.state == "colliding") {
      movePlayer(player);
      player.penalitzation -= 1;
      if (player.penalitzation < 0) player.state = "alive";
    }
    else if( player.state == "blocked"){
      player.penalitzation -=1;
      if(player.penalitzation < 0) player.state = "alive";
    }
    else if (player.state == "alive") {
      if (player.isMoving) movePlayer(player);
      else rotatePlayer(player);
    }
  }
  for(var misilId in game.misils) {
    var misil = game.misils[misilId];
    moveMisil(misil);
    checkIfMissilOut(misil);
  }
  checkCollisionsPlayers();
  checkCollisionsTrahses();//Check for trashes and powerups
  checkCollisionsPowerUps();
  checkActions();
  //respawn
}

function atractAllPapers(player) {
  for (var trashId in game.trashes) {
    var trash = game.trashes[trashId];
    angle = Math.atan((player.y - trash.y)/(player.x - trash.x))*360/2*Math.PI;
    d = euclideanDist(player.x,player.y,trash.x,trash.y);
    var distance = game.powerUpTypes["magnet"].atract*(1/d)*intervalTime;
    trash.x += Math.cos(angle*2*Math.PI/360)*distance;
    trash.y += Math.sin(angle*2*Math.PI/360)*distance;
  }
  io.emit('trashesUpdate',game.trashes);
}

function calculateObjective(player1) {
  vecx = Math.cos(player1.angle*2*Math.PI/360);
  vecy = Math.sin(player1.angle*2*Math.PI/360);
  for (var playerId in game.players) {
    var player2 = game.players[playerId];
    vec2x = player2.x - player1.x;
    vec2y = player2.y - player1.y;
    d = Math.sqrt(vec2x*vec2x + vec2y*vec2y);
    angle = Math.acos((vec2x*vecx + vec2y*vecy)/d)*360/(2*Math.PI);
    if (Math.abs(angle) < game.powerUpTypes["misilOff"].thresholdAngle ) {
      return player2.id;
    }
  }
  return null;
}

function shootMisil(player) {
  var newMisil = {
    "id": (new Date()).getTime() + '' + Object.keys(game.powerUps).length,
    "x": 5 + player.x + game.vacuumTypes[player.type].radius*Math.cos(player.angle*2*Math.PI/360),
    "y": 5 + player.y + game.vacuumTypes[player.type].radius*Math.sin(player.angle*2*Math.PI/360),
    "angle": player.angle,
    "owner": player.id,
    "target": calculateObjective(player)
  };
  game.misils[newMisil.id] = newMisil;
  io.emit("misilCreated",newMisil)
}

function moveMisil(misil) {
  var distance = game.powerUpTypes["misilOff"].velocity*intervalTime;
  var vecx = Math.cos(misil.angle*2*Math.PI/360);
  var vecy = Math.sin(misil.angle*2*Math.PI/360);
  if (misil.target != null) {
    var player = game.players[misil.target];
    vec2x = player.x - misil.x;
    vec2y = player.y - misil.y;
    d2 = Math.sqrt(vec2x*vec2x + vec2y*vec2y);
    vec2x /= d2;
    vec2y /= d2;
    vecx += vec2x*game.powerUpTypes["misilOff"].rate;
    vecy += vec2y*game.powerUpTypes["misilOff"].rate;
    d = Math.sqrt(vecx*vecx + vecy*vecy);
    vecx /= d;
    vecy /= d;
    misil.angle = Math.atan(vecy/vecx)*360/(2*Math.PI);
    if (vecx < 0 && vecy < 0) // quadrant Ⅲ
      misil.angle = 180 + misil.angle;
    else if (vecx < 0) // quadrant Ⅱ
      misil.angle = 180 + misil.angle; // it actually substracts
    else if (vecy < 0) // quadrant Ⅳ
      misil.angle = 270 + (90 + misil.angle); // it actually substracts
    
  }
  misil.x += vecx*distance;
  misil.y += vecy*distance;
}

function checkIfMissilOut(misil) {
  if (misil.x < 0 || misil.x > game.map.width || misil.y < 0 || misil.y > game.map.height){
    delete game.misils[misil.id];
    io.emit('misilDeleted',misil);
  } else {
    for (var playerId in game.players) {
      var player = game.players[playerId];
      if (!(player.id == misil.owner) && euclideanDist(player.x,player.y,misil.x,misil.y) <= (game.vacuumTypes[player.type].radius + 8)){
        player.points -= 50;
        delete game.misils[misil.id];
        io.emit('misilDeleted',misil);
      }
    }
  }
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
        io.emit("trashDeleted",trash);
        delete game.trashes[trashId];
        player.points += game.trashTypes[trash.type].points;
        sendPuntuation();
        // console.log("Deleted Trash", trash);
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

function checkCollisionsPowerUps() {
  for(var playerId in game.players) {
    var player = game.players[playerId];
    for(var powerUpId in game.powerUps) {
      var powerUp = game.powerUps[powerUpId];
      if (playerTrashOrPowerUpCollision(player,powerUp)) {
        givePowerUp(player, powerUp);
        io.emit('powerUpDeleted', powerUp);
        delete game.powerUps[powerUpId];
        console.log("Deleted PowerUp", powerUp);
      }
    }
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
      "player": game.players[playerId].type,
      "points": game.players[playerId].points
    });
  }
  puntuation.sort((a,b) => { return b.points - a.points;});
  io.emit('points', puntuation);
}
