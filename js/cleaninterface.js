// File for Interface with the HTML
//

// Global callback
var cleanChoiceCallback = function(choiceid) {return false;};
var cleanMoveCallback = function(x,y) {return false;};

// Objects
function cleanTextArea(div_id) {
	this.textArea = document.getElementById(div_id);
}

cleanTextArea.prototype.update = function(game, readtext) {
	var front;
	var back;
	// parse out any unavailible choices, and make links
	front = readtext.indexOf('{');
	while (front !== -1) {
		var choiceid = +(readtext.slice(front+1,readtext.indexOf('}',front+1)));
		if (!game.choiceAvailable(choiceid)) {
			// remove this bit
			var rmfront = front;
			while (rmfront !== -1) {
				var rmback = readtext.indexOf('{/'+choiceid+'}', rmfront+3);
				if (rmback === -1) {
					throw new Error("Malformed text");
				}
				var rmbackback = readtext.indexOf('}', rmback+3);
				readtext = readtext.slice(0, rmfront) + readtext.slice(rmbackback+1);
				rmfront = readtext.indexOf('{'+choiceid+'}');
			}
		} else if (!game.choiceChooseable(choiceid)) {
			// just remove the tags around it
			readtext = readtext.replace(new RegExp('\\{'+ choiceid +'\\}', 'g'), '');
			readtext = readtext.replace(new RegExp('\\{\\/'+ choiceid +'\\}', 'g'), '');
		} else {
			// turn this part to a link
			readtext = readtext.replace(new RegExp('\\{'+ choiceid +'\\}', 'g'), '<a class="choice" id="choice'+ choiceid +'" onclick="cleanChoiceCallback('+ choiceid +');">');
			readtext = readtext.replace(new RegExp('\\{\\/'+ choiceid +'\\}', 'g'), '</a>');
		}
		front = readtext.indexOf('{');
	}

	// if you want to do +=, you have to first parse out the links previous
	// a better way would be to add to some history subdiv or something
	// TODO
	this.textArea.innerHTML = readtext;
};

function cleanMapArea(div_id) {
	this.mapArea = document.getElementById(div_id);
	this.ns = "http://www.w3.org/2000/svg";

	// cached for animating reasons
	this.xpad = 0;
	this.ypad = 0;
	this.boxsize = 0;
};

cleanMapArea.prototype.clear = function() {
	while (this.mapArea.firstChild) {
		    this.mapArea.removeChild(this.mapArea.firstChild);
	}
};

cleanMapArea.prototype.coord2px = function(x,y) {
	var ret = {};
	ret.x = this.xpad + (this.boxsize * x);
	ret.y = this.ypad + (this.boxsize * y);
	return ret;
};

cleanMapArea.prototype.update = function(game) {
	this.clear();
	if (game.currentRoomName !== undefined) {
		return;
	}
	if (game.player.position === undefined) {
		throw new Error("Tried to draw map with no player position set");
	}

	var rec = this.mapArea.getBoundingClientRect();
	var map = game.maps[game.player.position.mapName];
	var ylen = map.tiles.length;
	var xlen = map.tiles[0].length;
	this.xpad = 0;
	this.ypad = 0;
	this.boxsize = 0;

	// Draw map
	if (rec.width / xlen > rec.height / ylen) {
		// pad x
		this.boxsize = rec.height / ylen;
		this.xpad = (rec.width - (xlen * this.boxsize)) / 2;
	} else {
		// pad y
		this.boxsize = rec.width / xlen;
		this.ypad = (rec.height - (ylen * this.boxsize)) / 2;
	}

	for (var y=0; y<ylen; y++) {
		for (var x=0; x<xlen; x++) {
			var tile = document.createElementNS(this.ns, 'image');
			tile.setAttribute('href', map.tiles[y][x].iconPath);
			tile.setAttribute('x', this.xpad + (this.boxsize * x));
			tile.setAttribute('y', this.ypad + (this.boxsize * y));
			tile.setAttribute('width', this.boxsize);
			tile.setAttribute('height', this.boxsize);
			if (map.tiles[y][x].movable) {
				tile.setAttribute('onclick', 'cleanMoveCallback('+ x +','+ y +');');
			}
			this.mapArea.appendChild(tile);
		}
	}

	// Draw Rooms
	game.rooms.forEach(function(room) {
		if (room.active && room.iconPath !== undefined && room.position != undefined && room.position.mapName == map.name) {
			var tile = document.createElementNS(this.ns, 'image');
			tile.setAttribute('href', room.iconPath);
			tile.setAttribute('x', this.xpad + (this.boxsize * room.position.x));
			tile.setAttribute('y', this.ypad + (this.boxsize * room.position.y));
			tile.setAttribute('width', this.boxsize);
			tile.setAttribute('height', this.boxsize);
			this.mapArea.appendChild(tile);
		}
	});

	// Draw Player
	if (game.player.iconPath !== undefined) {
			var tile = document.createElementNS(this.ns, 'image');
			tile.setAttribute('href', game.player.iconPath);
			tile.setAttribute('x', this.xpad + (this.boxsize * game.player.position.x));
			tile.setAttribute('y', this.ypad + (this.boxsize * game.player.position.y));
			tile.setAttribute('width', this.boxsize);
			tile.setAttribute('height', this.boxsize);
			tile.setAttribute('id','playericon');
			this.mapArea.appendChild(tile);
	}
	
};

function cleanInterface(gameobj, textdivid, mapdivid) {
	this.game = gameobj
	this.textArea = new cleanTextArea(textdivid);
	this.mapArea = new cleanMapArea(mapdivid);
	this.animating = false;

	var that = this
	cleanChoiceCallback = function(choiceid) {
		that.makeChoice(choiceid);
		return false;
	};
	cleanMoveCallback = function(x,y) {
		that.move(x,y);
		return false;
	}
}

cleanInterface.prototype.pathfind = function(sx,sy) {
	var x = this.game.player.position.x;
	var y = this.game.player.position.y;
	var map = this.game.maps[this.game.player.position.mapName].tiles;
	var fmap = [[]];
	for (var dy=0; dy<map.length; dy++) {
		fmap[dy] = [];
	}
	var q = [];
	fmap[y][x] = {px:x, py:y};
	q.push({x:x, y:y});
	var reached = false;
	while (q.length > 0) {
		// check if we made it
		if (q[0].x == sx && q[0].y == sy) {
			reached = true;
			break;
		} else {
			// add all eligible neighbors
			for (var dy=-1; dy<=1; dy++) {
				for (var dx=-1; dx<=1; dx++) {
					// No diagonal
					if (dy !== 0 && dx !== 0) {
						continue;
					}
					if (dy === 0 && dx === 0) {
						continue;
					}
					var mx = q[0].x + dx;
					var my = q[0].y + dy;
					// check in bounds
					if (mx < 0 || mx > map[0].length || my < 0 || my > map.length) {
						continue;
					}
				// check movable
					if (!map[my][mx].movable) {
						continue;
					}
					// check not already traversed
					if (fmap[my][mx] !== undefined) {
						continue;
					}
					// add it's previous
					fmap[my][mx] = {px: q[0].x, py: q[0].y};
					// add to q
					q.push({x:mx, y:my});
				}
			}
		}
		q.shift(1);
	}
	if (reached) {
		// make path 
		var path = [];
		var px = sx;
		var py = sy;
		while (true) {
			// end
			if (px == x && py == y) {
				break;
			}
			path.push({x:px, y:py});
			var next = fmap[py][px];
			px = next.px;
			py = next.py;
		}
		return path;
	}
	return [];
};

cleanInterface.prototype.move = function(x,y) {
	if (this.game.currentRoomName !== undefined) {
		return;
	} else {
		// if we are animating, return
		if (this.animating) {
			return;
		}
		// get path
		var path = this.pathfind(x,y);
		var that = this;
		this.animating = true;
		for (var i=path.length - 1; i>=0; i--) {
			var newx = path[i].x;
			var newy = path[i].y;
			var newpx = this.mapArea.coord2px(path[i].x, path[i].y);
			Velocity(document.getElementById("playericon"),{x:newpx.x, y:newpx.y}, {duration: 100,
				complete: (i==0)?function() {
					that.game.player.position.x = newx;
					that.game.player.position.y = newy;
					that.animating = false;
					that.game.updateOverRoom();
					that.update();
				} : undefined
			});
		}
	}
};

cleanInterface.prototype.expandAllMap = function() {

};

cleanInterface.prototype.expandHalfHalf = function() {

};

cleanInterface.prototype.expandAllText = function() {

};

cleanInterface.prototype.update = function() {
	// get state
	if (this.game.currentRoomName !== undefined) {
		// Just text
	} else if (this.game.overRoomName !== undefined) {
		// half half
	} else {
		// Just Map
	}
	this.textArea.update(this.game, this.game.read());
	this.mapArea.update(this.game);
};

cleanInterface.prototype.makeChoice = function(choiceid) {
	this.game.makeChoice(choiceid);
	this.update();	
};

// Run the story
cleanInterface.prototype.runGame = function() {
	this.update();
};
