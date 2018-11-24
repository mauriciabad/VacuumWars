var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/controller/index.html');
});

http.listen(3000, function(){
  console.log('listening on localhot:3000');
});

io.on('connection', function(socket){
  var player = '';

  console.log('Connected user: ' + socket.id);

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('rename', function(name){
    console.log(name);
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


/*
Aqui escriu el Mauri

*/




/*
Aqui escriu l'Alvaro
*/




/*
Aqui escriu el Carles
*/




