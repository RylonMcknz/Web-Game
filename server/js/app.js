var express = require('express'),
	app = express(),
	server = require('http').Server(app),
	io = require('socket.io').listen(server),
	path = require('path'),
	map = require('./map'),
	players = require('./players'),
	dice = require('./dice');
// 	mb = require('./modbot');
// console.log(mb);
server.listen(8080, function() {
	console.log('Server started on port 8080');	
});

app.get('/', function(req, res) {
	res.sendFile(path.resolve(__dirname + '/../../client/index.html'));
});
app.use('/client', express.static(__dirname + '/../../client'));

var playersObj = new players.players();
var mainMapObj;
var diceObj;
//var playersObj = players;

io.sockets.on('connection', function(socket) {
	var socketID = socketController.getSocketID();
	socketController.addSocket(socket, socketID);

	playersObj.addPlayer(socket, socketID);
	
	io.sockets.emit('player added');

	mainMapObj = new map.mainMap(socket);

	diceObj = new dice.dice(socket);
	//io.to(socket.id).emit('greeting', mb.modbot.greeting());

	// socket.on('send message', function(data) {
	// 	io.sockets.emit('new message', data);
	// });
});

var socketController = (function() {

	var current_sockets = {};
	var num_of_sockets = Object.keys(current_sockets).length;

	function getSocketID() {
		var socketIDs = [];
		for (var i = 0; i < num_of_sockets; i++) {
			socketIDs.push(current_sockets[i].ID);
		}
		for (var id = 0; id < num_of_sockets; id++) {
			if (socketIDs.indexOf(id) == -1) {
				return id;
			}
		}
	}

	function addSocket(socket, socketID) {
		current_sockets[socketID] = socket;
	}

	return {
		getSocketID: getSocketID,
		addSocket: addSocket
	};
})();