// Load modules
var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var fs   = require("fs");

// Show HTML
app.get('/controller', (req, res) => {
  res.sendFile(__dirname + '/public/controller/index.html');
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
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

function sendGame() {
  
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
  player.x += Math.cos(player.angle)*10*player.linearVelocity*(1000/60)
  player.y += Math.sin(player.angle)*10*player.linearVelocity*(1000/60)

}

function reverseMovePlayer(player) {
    /*
    TODO: Afegir les velocitats a una variable
  */
  player.x -= Math.cos(player.angle)*10*player.linearVelocity*(1000/60)
  player.y -= Math.sin(player.angle)*10*player.linearVelocity*(1000/60)

}

function rotatePlayer(player) {
  player.angle += 10*player.angularVelocity*(1000/60)
  player.angle %= 360

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
  for(const playerId in game.players) {
    var player = game.players[playerId];
    for(const trash in game.trashes) {
      if (playerTrashCollision(player,trash)) {
        delete game.trashes[trash];
      }
    }

  }
}

function checkCollisionsPowerUps() {
  for(const playerId in game.players) {
    var player = game.players[playerId];
    for(const powerUp in game.powerUps) {
      if (playerPowerUpCollision(player,powerUp)) {
        delete game.powerUps[powerUp];
      }
    }
  }
}


function playerTrashCollision(player,trash) {
  return false;
}

function playerPlayerCollision(player1,player2) {
  return false;
}

function playerPowerUpCollision(player,powerUp) {
  return false;
}





