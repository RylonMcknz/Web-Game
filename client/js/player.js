// Player module... add more info

var player = (function() {
	//--------SOCKET
	var gameSocket;

	//--------SPRITES
	// Data for the tile highlight sprite
	var highlightData = {
		images: ["client/images/blue-tile-highlight.png"],
		frames: {width: 64, height: 32, count: 1, regX: 0, regY: 0, spacing: 0, margin: 0}
	};
	// Data for the player sprite sheet
	var dragonSheetData = {
		images: ["client/images/wyvern_sheet_35percent.png"],
		frames: {width: 89.6, height: 89.6, count: 448, regX: 22.4, regY: 44.8, spacing: 0, margin: 0},
		animations: {
			hoverUpRight: [168, 175],
			hoverUp: [112, 119],
			hoverUpLeft: [56, 63],
			hoverLeft: [0, 7],
			hoverDownLeft: [392, 399],
			hoverDown: [336, 343],
			hoverDownRight: [280, 287],
			hoverRight: [224, 231],

			flyUpRight: [176, 183],
			flyUp: [120, 127],
			flyUpLeft: [64, 71],
			flyLeft: [8, 15],
			flyDownLeft: [400, 407],
			flyDown: [344, 351],
			flyDownRight: [288, 295],
			flyRight: [232, 239]
		}
	};
	// Create player sprite sheet from relevant data
	var dragonSheet = new createjs.SpriteSheet(dragonSheetData);
	// Create tile highlight sheet from relevant data
	var highlightSheet = new createjs.SpriteSheet(highlightData);
	// Create container for the player
	var playerContainer = new createjs.SpriteContainer(dragonSheet);
	// Create container for the players movement options
	var moveOptionsContainer = new createjs.SpriteContainer()
	// Create starting animation and add it to container
	var playerAnimation = new createjs.Sprite(dragonSheet, "hoverDownRight");
	playerContainer.addChild(playerAnimation);

	// //--------ATTRIBUTES
	// // Multiplier for dice roll
	// var moveAbility = 1;

	// //--------LOGIC QUANTITIES
	// // Player indices to determine player position 
	// var playerIndexX = 4;
	// var playerIndexY = 8;
	// // Boolean to determine when player space chooses should be shown
	// var playerIsChoosing = false;
	// Keycode for enter key
	var KEYCODE_ENTER = 13;

	// //--------SUBSCRIPTIONS
	// // Subscribe to dice roll
	//pubsub.subscribe('setMovementOptions', setMovementOptions);
	// pubsub.subscribe('diceRolled', setChoosingStateOn);

	//--------SOCKET ONS
	if (gameSocket) {
		gameSocket.on('player set', function(data) {
			updatePosition(data);
		});
		gameSocket.on('player moving', function(data) {
			movementAmination(data);
		});
		gameSocket.on('player stepped', function(data) {
			updatePosition(data);
		});
		gameSocket.on('player hovering', function(data) {
			hoverAnimation(data);
		});
		gameSocket.on('add movement options', function(data) {
			addMovementOptions(data);
		});
		gameSocket.on('remove movement options', function() {
			removeMovementOptions();
		});
	}

	//--------EVENT LISTENERS
	// Add event listener for when player makes a movement decision
	window.addEventListener("keydown", playerController, false);

	// //--------STATE FUNCTIONS
	// // Functions for changing or getting the player choosing state
	// function setChoosingStateOn() {
	// 	playerIsChoosing = true;
	// }
	// function setChoosingStateOff() {
	// 	playerIsChoosing = false;
	// }

	//--------SOCKET SETTER
	function setSocket(socket) {
		gameSocket = socket;
	}

	//--------KEYPRESS FUNCTION
	// Function for handling the players movement decision
	function playerController(e) {
		switch(e.keyCode) {
			case KEYCODE_ENTER:
				gameSocket.emit('enter pressed', {
					playerX: playerContainer.x,
					playerY: playerContainer.y
				});
		}
	}

	//--------MOVEMENT FUNCTIONS
	// Set movement animation
	function movementAmination(playerDirection) {
		var flightAnimation = "fly" + playerDirection;
		playerAnimation.gotoAndPlay(flightAnimation);
	}

	// Set hover animation
	function hoverAnimation(playerDirection) {
		var hoverAnimation = "hover" + playerDirection;
		playerAnimation.gotoAndPlay(hoverAnimation);
	}

	// Move player sprite toward cursor
	function updatePosition(playerPosition) {
		playerContainer.x = playerPosition.xPlayer;
		playerContainer.y = playerPosition.yPlayer;
	}

	// // Add or remove movement options
	// function setMovementOptions(stage) {
	// 	if (playerIsChoosing) {
	// 		addMovementOptions(stage);
	// 	}
	// 	else {
	// 		removeMovementOptions();
	// 	}
	// }
	// Set the tile highlights which represent movement options
	function addMovementOptions(stage) {
		var rollValue = dice.getDiceValue();
		// Set origin at which to start drawing movement options
		var originX = playerContainer.x - rollValue * 32;
		var originY = playerContainer.y - rollValue * 16;
		// Draw as map is drawn (see setMap function)
		var offSet = 0;
		var variableAddOne = 1;
		for (var i = 0; i < (2 * rollValue + 1); i++) {
			offSet = i%2 == 0 ? 0 : 32;
			// VariableAddOne  makes sure the movement options are square
			variableAddOne = i%2 == 0 ? 1 : 0;
			for (var j = 0; j < (rollValue + variableAddOne); j++) {
				var blueTileHighlight = new createjs.Sprite(highlightSheet, 0);
				blueTileHighlight.x = originX + offSet + j * 64;
				blueTileHighlight.y = originY + i * 16;
				moveOptionsContainer.addChild(blueTileHighlight);
			}
		}
		pubsub.publish('movementOptionsSet', null)
		stage.addChild(moveOptionsContainer);
	}
	function removeMovementOptions() {
		moveOptionsContainer.removeAllChildren();
	}

	//--------RENDER
	// Set the player to the stage
	function setPlayer(stage) {
		stage.addChild(playerContainer);
	}

	//--------API
	// Return the functions needed outside of this module
	return {
		//setChoosingStateOn: setChoosingStateOn,
		addMovementOptions: addMovementOptions,
		removeMovementOptions: removeMovementOptions,
		setPlayer: setPlayer,
		setSocket: setSocket
	};
})();

