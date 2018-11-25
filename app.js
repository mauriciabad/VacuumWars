// Load modules
var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var fs      = require("fs");

// Show HTML
app.use(express.static('public'));


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

  var player = game.players[socket.id];
  player.id  = socket.id;
  player.x   = Math.floor(Math.random()*game.map.width);
  player.y   = Math.floor(Math.random()*game.map.height);

  io.emit('playerConnect', player);
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
  io.emit('trashes',game.trashes)  
}


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
    if (player.isMoving) movePlayer(player);
    else rotatePlayer(player);
  }

  checkCollisionsPlayers();
  checkCollisionsTrahses();
  checkCollisionsPowerUps();
  checkActions();
  repopulatePowerUp();
  repopulateTrash();
  //respawn
}

/*
Aqui escriu el Carles
*/

function movePlayer(player) {
  /*
    TODO: Afegir les velocitats a una variable
  */
  player.x += Math.cos(player.angle*2*Math.PI/360)*0.5*player.linearVelocity*(1000/60)
  player.y += Math.sin(player.angle*2*Math.PI/360)*0.5*player.linearVelocity*(1000/60)

}

function reverseMovePlayer(player) {
    /*
    TODO: Afegir les velocitats a una variable
  */
  player.x -= Math.cos(player.angle*2*Math.PI/360)*0.5*player.linearVelocity*(1000/60)
  player.y -= Math.sin(player.angle*2*Math.PI/360)*0.5*player.linearVelocity*(1000/60)

}

function rotatePlayer(player) {
  player.angle += 0.1*player.angularVelocity*(1000/60);
  player.angle %= 360;

}

function addTrash(toAdd) {
  /*
  TODO: La trash es random pero es pot superposar
  */
  while (toAdd--) {
      game.trashes.push({
        "x": Math.random()*game.map.width,
        "y": Math.random()*game.map.height,
        "type": "paper"
      })
  }
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

function checkCollisionsPowerUps() {
  var broadcast = false
  for(const playerId in game.players) {
    var player = game.players[playerId];
    for(const powerUp in game.powerUps) {
      if (playerTrashOrPowerUpCollision(player,powerUp)) {
        delete game.powerUps[powerUp];
      }
    }
  }
  if (broadcast) {
    io.emit('powerUps',game.powerUps)
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
  var moveX = 10/2
  var moveY = 10/2
  return( pointInCircle(player.x,player.y,20, object.x + moveX, object.y + moveY) ||
          pointInCircle(player.x,player.y,20, object.x + moveX, object.y - moveY) ||
          pointInCircle(player.x,player.y,20, object.x - moveX, object.y + moveY) ||
          pointInCircle(player.x,player.y,20, object.x - moveX, object.y - moveY)
    );
}






