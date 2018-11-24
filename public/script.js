var socket   = io();
var trashes  = []; 
var powerUps = [];
var players  = {};
var trashesRaster  = []; 
var powerUpsRaster = []; 
var playersRaster  = []; 

socket.on('players', (newPlayers) => {
  players = newPlayers;
  for (const player of players) {
    let i = playersRaster.push(new Raster(`textures/vacuum/${player.type}.png`))  - 1;
    playersRaster[i].position.x = player.x;
    playersRaster[i].position.y = player.y;
  }
});

socket.on('powerUps', (newPowerUps) => {
  powerUps = newPowerUps;
  for (const powerUp of powerUps) {
    let i = powerUpsRaster.push(new Raster(`textures/powerUp/${powerUp.type}.png`))  - 1;
    powerUpsRaster[i].position.x = powerUp.x;
    powerUpsRaster[i].position.y = powerUp.y;
  }
});

socket.on('trashes', (newTrashes) => {
  trashes = newTrashes;
  for (const trash of trashes) {
    let i = trashesRaster.push(new Raster(`textures/trash/${trash.type}.png`))  - 1;
    trashesRaster[i].position.x = trash.x;
    trashesRaster[i].position.y = trash.y;
  }
});




function onResize(event) {
	// Whenever the window is resized, recenter the path:
	paper.position = view.center;
}





// -------- Mauri -------



// ------- Alvaro --------



// ------- Carles --------



// -----------------------