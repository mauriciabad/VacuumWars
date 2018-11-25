window.onload = function() {
  var canvas = document.getElementById('canvas');
  paper.setup(canvas);



  var socket   = io();
  var trashes  = {}; 
  var powerUps = {};
  var players  = {};
  
  socket.on('setup', (game) => {
    canvas.height = game.map.height;
    canvas.width  = game.map.width;
  });

  socket.on('playerConnect', (connectedPlayer) => {    
    players[connectedPlayer.id] = connectedPlayer;
    players[connectedPlayer.id].raster = new paper.Raster(`textures/vacuum/${connectedPlayer.type}.png`);
    players[connectedPlayer.id].raster.position = new paper.Point(connectedPlayer.x, connectedPlayer.y);
    players[connectedPlayer.id].raster.rotate(90);
    console.log("Connected Player", connectedPlayer);
  });
  
  socket.on('playerDisconnect', (disconnectedPlayer) => {
    players[disconnectedPlayer.id].raster.remove();
    delete players[disconnectedPlayer.id];
    console.log("Disconnected Player", disconnectedPlayer);
  });
  
  socket.on('playersUpdate', (newPlayers) => {
    for(var player in newPlayers) {
      var angle = newPlayers[player].angle - players[player].angle;
      players[player].x = newPlayers[player].x
      players[player].y = newPlayers[player].y
      players[player].angle = newPlayers[player].angle
      players[player].raster.position = new paper.Point(players[player].x, players[player].y);
      players[player].raster.rotate(angle);
    }
  });
  
  socket.on('trashCreated', (newTrash) => {
    trashes[newTrash.id] = newTrash;
    trashes[newTrash.id].raster = new paper.Raster(`textures/trash/${newTrash.type}.png`);
    trashes[newTrash.id].raster.position = new paper.Point(newTrash.x, newTrash.y);
    trashes[newTrash.id].raster.sendToBack();
    console.log("Created Trash", newTrash);
  });

  socket.on('trashDeleted', (deletedTrash) => {
    trashes[deletedTrash.id].raster.remove();
    delete trashes[deletedTrash.id];
    console.log("Deleted Trash", deletedTrash);
  });
  
  socket.on('powerUpCreated', (newPowerUp) => {
    powerUps[newPowerUp.id] = newPowerUp;
    powerUps[newPowerUp.id].raster = new paper.Raster(`textures/powerups/${newPowerUp.type}.png`);
    powerUps[newPowerUp.id].raster.position = new paper.Point(newPowerUp.x, newPowerUp.y);
    powerUps[newPowerUp.id].raster.sendToBack();
    console.log("Created PowerUp", newPowerUp);
  });

  socket.on('deletedPowerUp', (deletedPowerUp) => {
    powerUps[deletedPowerUp.id].raster.remove();
    delete powerUps[deletedPowerUp.id];
    console.log("Deleted PowerUp", deletedPowerUp);
  });


  // this player movement
  var tool = new paper.Tool();
  tool.onKeyDown = function(event) {
    switch (event.key) {
      case 'space':
      move(true, event);
        break;
      case 'enter':
      action(true, event);
        break;
    }
    return false;
  }
  tool.onKeyUp = function(event) {
    switch (event.key) {
      case 'space':
      move(false, event);
        break;
      case 'enter':
      action(false, event);
        break;
    }
    return false;
  }
  
  var scoreboard = document.getElementById('scoreboard');
  
  socket.on('points', (puntuation) => {
    console.log(puntuation);
    var content = '';
    for (var pair in puntuation) {
      content += `<li>${puntuation[pair].player}: ${puntuation[pair].points}p</li>`;
    }
    scoreboard.innerHTML = content;
  });
  
  function move(isMoving, e) {
    console.log('isMoving', isMoving);
    e.preventDefault();
    socket.emit('move', isMoving);
  }
  function action(isActing, e) {
    console.log('isActing', isActing);
    e.preventDefault();
    socket.emit('active', isActing);
  }
  function rename(name) {
    socket.emit('rename', name);      
  }
  function changeVacuum(vacuum) {
    socket.emit('changeVacuum', vacuum);      
  }












  paper.view.draw();
}
