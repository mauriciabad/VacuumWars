window.onload = function() {
  var canvas = document.getElementById('canvas');
  paper.setup(canvas);



  var socket   = io();
  var trashes  = {}; 
  var powerUps = {};
  var players  = {};
  var misils   = {};
  var audios   = {
    "misil-launch": new Audio('sounds/misil.ogg'),
  }

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
      players[player].x = newPlayers[player].x + 2*(0.5 - Math.random())*2;
      players[player].y = newPlayers[player].y + 2*(0.5 - Math.random())*2;
      players[player].angle = newPlayers[player].angle;
      players[player].raster.position = new paper.Point(players[player].x, players[player].y);
      players[player].raster.rotate(angle);

      animatePowerUps();
    }
  });

  function animatePowerUps() {
    for (var powerUpId in powerUps) {
      powerUps[powerUpId].raster.rotate(powerUps[powerUpId].rotationSpeed);
    }
  }
  
  socket.on('trashCreated', (newTrash) => {
    trashes[newTrash.id] = newTrash;
    trashes[newTrash.id].raster = new paper.Raster(`textures/trash/${newTrash.type}.png`);
    trashes[newTrash.id].raster.position = new paper.Point(newTrash.x, newTrash.y);
    trashes[newTrash.id].raster.sendToBack();
    trashes[newTrash.id].raster.rotate(Math.random()*360);
    console.log("Created Trash", newTrash);
  });

  socket.on('trashesUpdate', (newTrash) => {
    for(var trash in newTrash) {
      trashes[trash].x = newTrash[trash].x;
      trashes[trash].y = newTrash[trash].y;
      trashes[trash].raster.position = new paper.Point(trashes[trash].x, trashes[trash].y);
    }
  });

  socket.on('trashDeleted', (deletedTrash) => {
    trashes[deletedTrash.id].raster.remove();
    delete trashes[deletedTrash.id];
    console.log("Deleted Trash", deletedTrash);
  });
  
  socket.on('powerUpCreated', (newPowerUp) => {
    powerUps[newPowerUp.id] = newPowerUp;
    powerUps[newPowerUp.id].rotationSpeed = 2 + 2*Math.random();
    powerUps[newPowerUp.id].raster = new paper.Raster(`textures/powerups/${newPowerUp.type}.png`);
    powerUps[newPowerUp.id].raster.position = new paper.Point(newPowerUp.x, newPowerUp.y);
    powerUps[newPowerUp.id].raster.sendToBack();
    console.log("Created PowerUp", newPowerUp);
  });

  socket.on('powerUpDeleted', (deletedPowerUp) => {
    powerUps[deletedPowerUp.id].raster.remove();
    delete powerUps[deletedPowerUp.id];
    console.log("Deleted PowerUp", deletedPowerUp);
  });
  
  socket.on('misilCreated', (newMisil) => {
    misils[newMisil.id] = newMisil;
    misils[newMisil.id].raster = new paper.Raster(`textures/powerups/misil.png`);
    misils[newMisil.id].raster.position = new paper.Point(newMisil.x, newMisil.y);
    misils[newMisil.id].raster.rotate(newMisil.angle);
    misils[newMisil.id].raster.sendToBack();
    console.log("Created Misil", newMisil);
    audios['misil-launch'].play()
  });

  socket.on('misilDeleted', (deletedMisil) => {
    misils[deletedMisil.id].raster.remove();
    delete misils[deletedMisil.id];
    console.log("Deleted Misil", deletedMisil);
  });

  socket.on('misilsUpdate', (newMisil) => {
    for(var misil in newMisil) {
      var angle = newMisil[misil].angle - misils[misil].angle;
      misils[misil].x = newMisil[misil].x;
      misils[misil].y = newMisil[misil].y;
      misils[misil].angle = newMisil[misil].angle;
      misils[misil].raster.position = new paper.Point(misils[misil].x, misils[misil].y);
      misils[misil].raster.rotate(angle);
    }
  });

    
  var scoreboard = document.getElementById('scoreboard');
  
  socket.on('points', (puntuation) => {
    console.log(puntuation);
    var content = '';
    for (var pair in puntuation) {
      content += `<li><img src="textures/vacuum/${puntuation[pair].player}.png">: ${puntuation[pair].points}p</li>`;
    }
    scoreboard.innerHTML = content;
  });
  

  // this player movement
  // var tool = new paper.Tool();
  // tool.onKeyDown = function(event) {
  //   switch (event.key) {
  //     case 'space':
  //     move(true, event);
  //       break;
  //     case 'enter':
  //     action(true, event);
  //       break;
  //   }
  //   return false;
  // }
  // tool.onKeyUp = function(event) {
  //   switch (event.key) {
  //     case 'space':
  //     move(false, event);
  //       break;
  //     case 'enter':
  //     action(false, event);
  //       break;
  //   }
  //   return false;
  // }

  // function move(isMoving, e) {
  //   console.log('isMoving', isMoving);
  //   e.preventDefault();
  //   socket.emit('move', isMoving);
  // }
  // function action(isActing, e) {
  //   console.log('isActing', isActing);
  //   e.preventDefault();
  //   socket.emit('active', isActing);
  // }
  // function rename(name) {
  //   socket.emit('rename', name);      
  // }
  // function changeVacuum(vacuum) {
  //   socket.emit('changeVacuum', vacuum);      
  // }
  socket.emit('ignoreMe', true);      












  paper.view.draw();
}
