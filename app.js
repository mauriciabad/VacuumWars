var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/controller/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
    socket.emit('welcome','heh<aaaa');
  });

  socket.on('move', function(isMoving){
    if(isMoving) console.log("Socket Move");
    else console.log("Stopped Moving");
  });

  socket.on('active', function(isActing){  
    if(isActing) console.log("Socket Active"); 
    else console.log("Socket not acting"); 
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});



/*
Aqui escriu el Mauri

*/




/*
Aqui escriu l'Alvaro
*/




/*
Aqui escriu el Carles
*/




