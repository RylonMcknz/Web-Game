
// SERVER SIDE map module
var mainMap = function(socket) {
	//--------LOGIC QUANTITIES	
	// Set original cursor indices to zero
	var cursorIndexX = 0;
	var cursorIndexY = 0;

	var xTileCursor;
	var yTileCursor;

	socket.on('move cursor', function(data) {
		moveCursor(data);
	});
	socket.on('set tile cursor', function() {
		setTileCursor();
	});


	function moveCursor(direction) {
		if (direction == 'left') {
			if (xTileCursor > 0 && yTileCursor > 0) {
				cursorIndexX -= 1;
				xTileCursor = (cursorIndexX - cursorIndexY) * 32;
				yTileCursor = (cursorIndexX + cursorIndexY) * 16;
			}
		}
		else if (direction == 'right') {
			if (xTileCursor < (1248 - 64) && yTileCursor < (656 - 32)) {
				cursorIndexX += 1;
				xTileCursor = (cursorIndexX - cursorIndexY) * 32;
				yTileCursor = (cursorIndexX + cursorIndexY) * 16;
			}
		}
		else if (direction == 'down') { 
			if (yTileCursor < (656 - 32) && xTileCursor > 0) {
				cursorIndexY += 1;
				xTileCursor = (cursorIndexX - cursorIndexY) * 32;
				yTileCursor = (cursorIndexX + cursorIndexY) * 16;
			}
		}
		else if (direction == 'up') {
			if (yTileCursor > 0 && xTileCursor < (1248 - 64)) {
				cursorIndexY -= 1;
				xTileCursor = (cursorIndexX - cursorIndexY) * 32;
				yTileCursor = (cursorIndexX + cursorIndexY) * 16;
			}
		}
		socket.emit('cursor moved', {
			xTileCursor: xTileCursor,
			yTileCursor: yTileCursor
		});
	}

	// Set the tile cursor on the stage
	function setTileCursor(stage) {
		socket.emit('tile cursor set', {
			xTileCursor: cursorIndexX * 64,
			yTileCursor: cursorIndexY * 16
		});
	}

	function getCursorPosition() {
		return {
			cursorIndexX: cursorIndexX,
			cursorIndexY: cursorIndexY,
			xTileCursor: xTileCursor,
			yTileCursor: yTileCursor
		};
	}

	return {
		getCursorPosition: getCursorPosition
	};

};

exports.mainMap = mainMap;