var player = require('./player');
//SERVER SIDE players module for managing the players connected

var players = function() {
	// All currently connected players
	var current_players = {};

	// Add a new player
	function addPlayer(socket, playerID) {
		current_players[playerID] = player.player(socket, playerID);
	}

	return {
		addPlayer: addPlayer
	};
};

exports.players = players;