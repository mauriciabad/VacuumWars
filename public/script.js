window.onload = function() {
  var canvas = document.getElementById('canvas');
  paper.setup(canvas);



  var socket   = io();
  var trashes  = []; 
  var powerUps = [];
  var players  = {};
  var trashesRaster  = []; 
  var powerUpsRaster = []; 
  var playersRaster  = []; 
  
  socket.on('players', (newPlayers) => {
    players = newPlayers;
    for (const player in players) {
      let i = playersRaster.push(new paper.Raster(`textures/vacuum/${players[player].type}.png`))  - 1;
      playersRaster[i].position = new paper.Point(players[player].x, players[player].y);
    }
  });
  
  socket.on('powerUps', (newPowerUps) => {
    powerUps = newPowerUps;
    for (const powerUp of powerUps) {
      let i = powerUpsRaster.push(new paper.Raster(`textures/powerUp/${powerUp.type}.png`))  - 1;
      powerUpsRaster[i].position = new paper.Point(powerUp.x, powerUp.y);
    }
  });
  
  socket.on('trashes', (newTrashes) => {
    trashes = newTrashes;
    for (const trash of trashes) {
      let i = trashesRaster.push(new paper.Raster(`textures/trash/${trash.type}.png`))  - 1;
      trashesRaster[i].position = new paper.Point(trash.x, trash.y);
    }
  });







  paper.view.draw();
}






// -------- Mauri -------



// ------- Alvaro --------



// ------- Carles --------



// -----------------------