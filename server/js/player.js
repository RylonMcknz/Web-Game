var app = require('./app');
var events = require('events');
// SERVER SIDE player module

var player = function(socket, playerID) {
	var eventEmitter = new events.EventEmitter();

	var socket = socket;
	var playerID = playerID;

	// Multiplier for dice roll
	var moveAbility = 1;

	//--------LOGIC QUANTITIES
	// Player indices to determine player position 
	var playerIndexX = 4;
	var playerIndexY = 8;
	var offSet = playerIndexY%2 == 0 ? 0 : 32;		
	var	xPlayer = offSet + playerIndexX * 64;
	var	yPlayer = playerIndexY * 16;

	// Boolean to determine when player space chooses should be shown
	var playerIsChoosing = false;

	//--------SUBSCRIPTIONS
	// Subscribe to dice roll
	//pubsub.subscribe('setMovementOptions', setMovementOptions);
	eventEmitter.on('diceRolled', setChoosingStateOn);

	//--------SOCKET ONS
	socket.on('enter pressed', function(data) {
		movePlayer(data);
	});
	socket.on('set movement options', function(data) {
		setMovementOptions(data);
	});

	//--------STATE FUNCTIONS
	// Functions for changing or getting the player choosing state
	function setChoosingStateOn() {
		playerIsChoosing = true;
	}
	function setChoosingStateOff() {
		playerIsChoosing = false;
	}

	// Add or remove movement options
	function setMovementOptions(mainStage) {
		if (playerIsChoosing) {
			socket.emit('add movement options', mainStage);
		}
		else {
			socket.emit('remove movement options');
		}
	}

	// Function for handling the players movement decision
	function movePlayer(playerPosition) {
		// Get information about map and tile cursor
		var cursorPosition = app.mainMapObj.getCursorPosition();
		var cursorIndexX = cursorPosition.cursorIndexX;
		var cursorIndexY = cursorPosition.cursorIndexY;
		var xTileCursor = cursorPosition.xTileCursor;
		var yTileCursor = cursorPosition.yTileCursor;
		
		// Set player indices for seting move options
		playerIndexX = cursorIndexX;
		playerIndexY = cursorIndexY;
		// Get information about how to move
		var cursorVect = [xTileCursor, -yTileCursor];
		var playerVect = [playerPosition.playerX, -playerPosition.playerY];
		var playerDirection = getPlayerDirection(cursorVect, playerVect);
		
		socket.emit('player moving', playerDirection);

		// Move, then play appropriate hover animation
		moveToCursor(cursorVect, playerVect, playerDirection);

		// Turn off choosing state after decision made
		setChoosingStateOff();
		// Turn on updates
		//pubsub.publish('addOrRemoveSprite', null);
	}

	// Function to return the players current direction
	function getPlayerDirection(cursorVect, playerVect) {
		// Terminal vector goes from player to tile cursor
		var terminalVect = vectorMath.subtract(cursorVect, playerVect);
		// Determine which initial vector to use based on sign of y-component of terminal vector
		if(terminalVect[1] < 0) {
			var initialVect = [-1, 0];
		}
		else {
			var initialVect = [1, 0];
		}
		// Get the angle in degrees
		var angleBetween = vectorMath.angleBetween(terminalVect, initialVect);
		// Make array of directions for the player animation
		var directions = ["UpRight", "Up", "UpLeft", "Left", "DownLeft", "Down", "DownRight", "Right"]
		var movementDirection = "DownRight";
		// Offset to provide eight different ranges with centers at 45 degree angles of unit circle
		var OFF_SET = 22.5;
		// Loop through until direction is found and return it
		for (var i = 0; i < directions.length; i++) {
			if( angleBetween >= (45*i + OFF_SET) && angleBetween < ( 45*(i + 1) + OFF_SET) ) {
				movementDirection = directions[i];
				return movementDirection;
			}
			else if( angleBetween >= 0 && angleBetween < OFF_SET) {
				movementDirection = directions[directions.length - 1];
				return movementDirection;
			}
		}
	}

	// Function to move the player to the cursor
	function moveToCursor(cursorVect, startPlayerVect, playerDirection) {
		// Target vector is a vector from the player to the cursor to which it will move
		var targetVect = vectorMath.subtract(cursorVect, startPlayerVect);
		var targetNorm = vectorMath.normalize(targetVect);
		var targetMagnitude = vectorMath.magnitude(targetVect);
		// Number of steps taken from "point A to point B"
		var NUM_OF_STEPS = 100;
		// Calculate the size of each step
		var stepSize = targetMagnitude/NUM_OF_STEPS;
		// Progress vector goes from the players original position to the players current position
		var progressMagnitude = 0;
		// Function to be called recursively until player gets to destination
		var stepTo = function() {
			// Determine if player has reached destination
			if(progressMagnitude < targetMagnitude) {
				// Take a step
				xPlayer += stepSize * targetNorm[0];
				yPlayer -= stepSize * targetNorm[1];
				socket.emit('player stepped', {xPlayer: xPlayer, yPlayer: yPlayer});
				// Current player vector goes from page window origin to current player location
				var currentPlayerVect = [xPlayer, -yPlayer];
				var progressVect = vectorMath.subtract(currentPlayerVect, startPlayerVect);
				progressMagnitude = vectorMath.magnitude(progressVect);
				// Take a step every 10 milliseconds
				setTimeout(stepTo, 10);
			}
			// Play hover animation when player arrives at destination
			else {
				socket.emit('player hovering', playerDirection);
			}
		};
		// Initiate movement 10 milliseconds after stepTo returns
		setTimeout(stepTo, 10);
	}


	// return {

	// };
};

exports.player = player;