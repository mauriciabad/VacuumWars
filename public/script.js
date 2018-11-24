window.onload = function() {
  var canvas = document.getElementById('canvas');
  paper.setup(canvas);



  var socket   = io();
  var trashes  = []; 
  var powerUps = [];
  var players  = {};
  
  socket.on('setup', (game) => {
    canvas.height = game.map.height;
    canvas.width  = game.map.width;
  });

  socket.on('playerDisconnect', (disconnectedPlayer) => {
    players[disconnectedPlayer.id].raster.remove();
    delete players[disconnectedPlayer.id];
  });
  socket.on('playerConnect', (connectedPlayer) => {    
    players[connectedPlayer.id] = connectedPlayer;
    players[connectedPlayer.id].raster = new paper.Raster(`textures/vacuum/${connectedPlayer.type}.png`);
    players[connectedPlayer.id].raster.position = new paper.Point(connectedPlayer.x, connectedPlayer.y);
    players[connectedPlayer.id].raster.rotate(connectedPlayer.angle);
  });
  
  socket.on('playersUpdate', (newPlayers) => {
    for (const player in players) {
      var angle = newPlayers[player].angle - players[player].angle;
      players[player] =  Object.assign(players[player], newPlayers[player]);
      players[player].raster.position = new paper.Point(players[player].x, players[player].y);
      players[player].raster.rotate(angle);
    }
  });
  
  socket.on('powerUps', (newPowerUps) => {
    // powerUps = newPowerUps;
    // for (const powerUp of powerUps) {
    //   let i = powerUpsRaster.push(new paper.Raster(`textures/powerUp/${powerUp.type}.png`))  - 1;
    //   powerUpsRaster[i].position = new paper.Point(powerUp.x, powerUp.y);
    // }
  });
  
  socket.on('trashes', (newTrashes) => {
    // trashes = newTrashes;
    // for (const trash of trashes) {
    //   let i = trashesRaster.push(new paper.Raster(`textures/trash/${trash.type}.png`))  - 1;
    //   trashesRaster[i].position = new paper.Point(trash.x, trash.y);
    // }
  });







  paper.view.draw();
}






// -------- Mauri -------



// ------- Alvaro --------



// ------- Carles --------



// -----------------------