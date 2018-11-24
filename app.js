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

function checkActions() {
  for (const playerId in game.players) {
    var player = game.players[playerId];
    if (player.isActing) executePowerUp(player.PowerUp); //Mirar si no es null
  }
}

function updateGame(){
  for (const playerId in game.players) {
    var player = game.players[playerId];
    if (palyer.isMoving) movePlayer(playerId);
    else rotatePlayer(playerId);
  }

  checkActions();
  checkCollisionsPlayers();
  checkCollisionsTrash();
  repopulateTrash();

}

/*
Aqui escriu el Carles
*/




