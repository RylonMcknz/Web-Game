// CLIENT SIDE App module... add more info

var app = (function() {
	//--------SOCKET
	var socket = io.connect('http://localhost:8080');
	//var socket = io();

	//--------SET SOCKET
	socket.on('connect', function() {
		mainMap.setSocket(socket);
		dice.setSocket(socket);
	});
	socket.on('player added', function() {
		player.setSocket(socket);
	});
	socket.on('dice rolling', function(data) {
		console.log(data);
	});

	//--------STAGE SETUP
	// Create the sprite stages
	var mainStage = new createjs.SpriteStage("mainCanvas", false, false);
	var menuStage = new createjs.SpriteStage("menuCanvas", false, false);
	// Update viewports (WebGL thing that I don't quite understand)
	mainStage.updateViewport(1248, 656);
	menuStage.updateViewport(320, 400);
	// Establish how often to update mouse overs in milliseconds
	mainStage.enableMouseOver(10);

	//--------STATE QUANTITIES
	// Bool two switch when things need updated in handleTick function
	var updatesNeeded = false;

	// Set the sizes of each canvas
	configureCanvasSizes();
	backgroundFade();

	//--------COMPONENT SETUP
	socket.emit('set tile cursor');

	// Set pieces to the stages
	mainMap.setMap(mainStage);
	mainMap.setTileCursor(mainStage);
	player.setPlayer(mainStage);
	dice.setDice(menuStage);

	//--------SUBSCRIPTIONS
	pubsub.subscribe('addOrRemoveSprite', updatesNeededOn);

	//--------EVENT LISTENERS
	// Create a ticker to update the page every tick
	createjs.Ticker.addEventListener("tick", handleTick);

	//--------UPDATES ON TICK
	// Function to execute every tick
	function handleTick(event) {
		if(updatesNeeded) {
			updatesNeeded = false;
			socket.emit('set movement options', mainStage);
			// Add or remove movement options
			//pubsub.publish('setMovementOptions', mainStage);
		}
		// Update the stages
		mainStage.update();
		menuStage.update();
	}	

	//--------STATE FUNCTION
	// Functions to set the updatesNeeded bool
	function updatesNeededOn() {
		updatesNeeded = true;
	}

	//--------CONFIGURATION FUNCTIONS
	function configureCanvasSizes() {
		var mainCanvas = document.getElementById('mainCanvas');
		//Width and height are calculated based on tile size.
		//Example: mainCanvas width is number of tiles times tile
		//width plus half of tile width
		mainCanvas.width = 1248;
		mainCanvas.height = 656;

		var menuCanvas = document.getElementById('menuCanvas');
		menuCanvas.width = 320;
		menuCanvas.height = 400;
	}

	function backgroundFade() {
		fade(document.body);
	}
})();


function fade(node) {
	var level = 40;
	var isEndColor = true;
	var step = function () {
		var hex = level.toString(16);
		node.style.backgroundColor = '#' + hex + hex + hex;
		if (level > 30 && isEndColor) {
			level -= 0.25;
			setTimeout(step, 10);
		}
		else if (level < 40 && !isEndColor) {
			level += 0.25;
			setTimeout(step, 10);
		}
		else if (level == 30) {
			isEndColor = false;
			setTimeout(step, 10);
		}
		else {
			isEndColor = true;
			setTimeout(step, 10);
		}
	};
	setTimeout(step, 200);
};

