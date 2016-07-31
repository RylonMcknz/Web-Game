var events = require('events');
//SERVER SIDE players module for managing the players connected

var dice = function(socket) {
	var eventEmitter = new events.EventEmitter();
	//--------LOGIC QUANTITIES
	// Value of dice roll
	var diceValue = 1;

	//--------SOCKET ONS
	socket.on('r pressed', function() {
		diceController();
	});

	// Add a new player
	function diceController() {
		// Math.floor(Math.random()*(max-min+1)+min);
		var randNumRoll = Math.floor(Math.random()*(20 - 1 + 1) + 1);
		var rollIndex = "roll" + randNumRoll;
		// Set the dice value
		diceValue = randNumRoll;
		// Turn on player choosing state after dice roll
		eventEmitter.emit('diceRolled', true);
		socket.emit('dice rolling', rollIndex);
	}

	// return {

	// };
};

exports.dice = dice;