

// Classes
//

// Player object
// holds player inventory
function cleanPlayer() {
	this.iconPath = undefined;
	this.position = new cleanPosition(0,0,undefined);
	this.inventory = [];
}

cleanPlayer.prototype.hasItem = function(itemname) {
	for (var i=0; i<this.inventory.length; i++) {
		if (itemname == this.inventory[i].name) {
			return true;
		}
	}
	return false;
};

cleanPlayer.prototype.addItems = function(items) {
	for (var i=0; i<items.length; i++) {
		var alreadyhaveit = false;
		for (var v=0; v<this.inventory.length; v++) {
			if (items[i].name == this.inventory[v].name) {
				alreadyhaveit = true;
				if (this.inventory[v].count < this.inventory[v].max) {
					this.inventory[v].count++;
				}
				break;
			}
		}
		if (!alreadyhaveit) {
			this.inventory.push(items[i]);
		}
	}
};

cleanPlayer.prototype.removeItems = function(itemnames) {
	for (var n=0; n<itemnames.length; n++) {
		for (var v=0; v<this.inventory.lenght; v++) {
			if (itemsnames[n] == this.inventory[v].name) {
				this.inventory.splice(v,1);
				break;
			}
		}
	}
};

// Position object
function cleanPosition(x, y, mapname) {
	this.x = x;
	this.y = y;
	this.mapName = mapname;
}

cleanPosition.prototype.copy = function(other) {
	this.x = other.x;
	this.y = other.y;
	this.mapName = other.mapName;
};

function cleanTile(iconpath) {
	this.iconPath = iconpath;
	this.movable = false;
}

// Map object
function cleanMap(name) {
	this.name = name;
	//tiles[y][x]
	this.tiles = [[]];
}

cleanMap.prototype.loadMap = function(arrayids, movable, icons) {
	for (var y=0; y<arrayids.length; y++) {
		this.tiles[y] = [];
		for (var x=0; x<arrayids[0].length; x++) {
			if (icons[arrayids[y][x]] === undefined) {
				throw new Error("Unknown icon id");
			}
			var iconpath = icons[arrayids[y][x]];
			var newtile = new cleanTile(iconpath);
			if (movable.indexOf(arrayids[y][x]) !== -1) {
				newtile.movable = true;
			}
			this.tiles[y][x] = newtile;
		}
	}
};

function cleanItem(name, visible) {
	this.name = name;
	// visible items show up in the inventory, others are used only as story boolean conditions between rooms
	this.visible = visible;
	// max is the number of this item you can have in your inventory
	this.max = 1;
	this.count = 1;
	this.description = undefined;
	this.expireTimer = undefined;
	this.value = ""; // a string value that can be set to user input
}

function cleanEffect() {
	this.gotItems = []; // list of items player gets when choice is choosen
	this.removeItemNames = []; // list of item names that get removed when choice is choosen
	this.playerLeaveRoom = false;
	this.playerEnterRoom = false;
	this.playerNewPosition = undefined; // new position for player
	this.playerNewIconPath = undefined;
	this.roomName = undefined; // room to change
	this.activate = false;
	this.deactivated = false;
	this.roomNewBranchName = undefined; // branch for room
	this.roomNewPosition = undefined; // new position for room // TODO, dont forget to add a game method for this
	this.roomNewIconPath = undefined;
	// TODO add sound fade
}

cleanEffect.prototype.addToChoices = function(ids, branch) {
	if (!Array.isArray(ids)) {
		ids = [ids];
	}
	for (var i=0; i<ids.length; i++) {
		if (branch.choices[ids[i]] === undefined) {
			throw new Error("Undefined Choice "+ ids[i] +" on branch "+ branch.name);
		}
		var c = branch.choices[ids[i]];
		c.effects.push(this);
	}
}

cleanEffect.prototype.happen = function(game) {
	// remove items
	game.player.removeItems(this.removeItemNames);
	// add items
	game.player.addItems(this.gotItems);
	// leave or enter room
	if (this.playerLeaveRoom === true && game.currentRoomName !== undefined) {
		game.player.position.copy(game.rooms.get(game.currentRoomName).position);
		game.currentRoomName = undefined;
		game.updateOverRoom();
	}
	if (this.playerEnterRoom === true) {
		game.currentRoomName = game.overRoomName;
	}	
	// move player
	if (this.playerNewPosition !== undefined) {
		game.player.position = this.playerNewPosition;
		game.updateOverRoom();
	}	
	if (this.roomName !== undefined) {
		if (this.activate) {
			game.rooms.get(this.roomName).active = true;
		}
		if (this.deactivate) {
			game.rooms.get(this.roomName).active = false;
		}
		// change room branch
		if (this.roomNewBranchName !== undefined) {
			game.rooms.get(this.roomName).currentBranchName = this.roomNewBranchName;
			// add to the branch counter
			game.branches.get(this.roomNewBranchName).counter++;
		}
		// change room position
		if (this.roomNewPosition !== undefined) {
			game.rooms.get(this.roomName).position = this.roomNewPosition;
			game.updateOverRoom();
		}
	}
};

// A choice in a branch, if choosen activates a branch and/or changes a players or room position
function cleanChoice() {
	// condition
	this.requiredItemNames = []; // list of lists of item names, if any groups pass, it passes
	this.forbiddenItemNames = []; // list of lists of item names, if any groups pass, it fails
	// activation
	this.effects = [];
}

cleanChoice.prototype.available = function(player) {
	var passed = false;
	if (this.requiredItemNames.length === 0) {
		passed = true;
	}
	for (var r=0; r<this.requiredItemNames.length; r++) {
		var grouphas = true;
		for (sr=0; sr<this.requiredItemNames[r].length; sr++) {
			if (!player.hasItem(this.requiredItemNames[r][sr])) {
				grouphas = false;
				break;
			}
		}
		if (grouphas) {
			passed = true;
			break;
		}
	}
	if (!passed) {
		return passed;
	}
	for (var f=0; f<this.forbiddenItemNames.length; f++) {
		var grouphas = true;
		for (sf=0; sf<this.forbiddenItemNames[f].length; sf++) {
			if (!player.hasItem(this.forbiddenItemNames[f][sf])) {
				grouphas = false;
				break;
			}
		}
		if (grouphas) {
			passed = false;
			break;
		}
	}
	return passed;
};

cleanChoice.prototype.makeChoice = function(game) {
	for (var e=0; e<this.effects.length; e++) {
		this.effects[e].happen(game);
	}
}

// Branch object
// for Story Logic
// holds text piece
function cleanBranch(name, text) {
	// choice text should only be shown if they cooresponding choice is availible (have needed items, dont have forbidden)
	this.name = name;
	this.text = text; // html string, with {0}clickable links{/0} matching choices
	this.choices = []; // array by choice id
	this.counter = 0; // number of times in this branch
}

cleanBranch.prototype.read = function() {
	return this.text;
};

cleanBranch.prototype.getChoice = function(choiceid) {
	if (this.choices[choiceid] === undefined) {
		throw new Error("Undefined choice");
	}
	return this.choices[choiceid];
};

// Room object
// holds text interaction
function cleanRoom(name) {
	this.name = name;
	this.iconPath = undefined;
	this.position = undefined;
	this.currentBranchName = undefined;
	this.active = true;
}

cleanRoom.prototype.setStartBranch = function(startbranch) {
	this.currentBranch = startbranch;
};

// Game object
// holds everything
function cleanGame() {
	this.turn = 0;
	this.icons = []; // array by id
	this.sounds = []; // array by id
	this.maps = new Map(); // map by name
	this.rooms = new Map(); // map by name
	this.branches = new Map(); // map by name
	this.currentRoomName = undefined; // room entered, no map shown
	this.overRoomName = undefined; // room over in map
	this.player = new cleanPlayer();
}

cleanGame.prototype.getBranch = function() {
	// get current room branch, if there, otherwise overroom branch
	var bname = undefined;
	if (this.currentRoomName !== undefined) {
		bname = this.rooms.get(this.currentRoomName).currentBranchName;
	} else if (this.overRoomName !== undefined) {
		bname = this.rooms.get(this.overRoomName).currentBranchName;
	} else {
		return undefined;
	}
	return this.branches.get(bname);
};

cleanGame.prototype.read = function() {
	var br = this.getBranch();
	if (br == undefined) {
		return "";
	}
	return br.read();
};

cleanGame.prototype.updateOverRoom = function() {
	// see if there is an active room where the player is
	this.overRoomName = undefined;
	var that = this;
	this.rooms.forEach(function(room) {
		if (room.position !== undefined && room.active == true && room.position.mapName == that.player.position.mapName && room.position.x == that.player.position.x && room.position.y == that.player.position.y) {
			that.overRoomName = room.name;
			// also add to the branch counter
			that.branches.get(that.rooms.get(room.name).currentBranchName).counter++;
		}
	});
}

cleanGame.prototype.choiceAvailable = function(choiceid) {
	var br = this.getBranch();
	return br.getChoice(choiceid).available(this.player);
};

cleanGame.prototype.choiceChooseable = function(choiceid) {
	var br = this.getBranch();
	return (br.getChoice(choiceid).effects.length > 0);
};

cleanGame.prototype.makeChoice = function(choiceid) {
	var br = this.getBranch();
	choice = br.getChoice(choiceid);
	choice.makeChoice(this);
};

cleanGame.prototype.getCurrentBranchCounter = function() {
	var br = this.getBranch();
	return br.counter;
}

cleanGame.prototype.addIcon = function(path, id) {
	this.icons[id] = path;
};

cleanGame.prototype.setPlayerIcon = function(path) {
	this.player.iconPath = path;
}

cleanGame.prototype.addMap = function(name, arrayids, movable) {
	var newmap = new cleanMap(name);
	newmap.loadMap(arrayids, movable, this.icons);
	this.maps[name] = newmap;
};

cleanGame.prototype.addRoom = function(name, pos) {
	if (this.rooms.get(name) !== undefined) {
		throw new Error("Room name taken");
	}
	var newroom = new cleanRoom(name);
	newroom.position = new cleanPosition(pos.x, pos.y, pos.map);
	this.rooms.set(name, newroom);
};

cleanGame.prototype.addBranch = function(name, text) {
	if (this.branches.get(name) !== undefined) {
		throw new Error("Branch name taken");
	}
	var newbranch = new cleanBranch(name, text);
	this.branches.set(name, newbranch);
};

cleanGame.prototype.setRoomBranch = function(roomname, branchname) {
	if (this.rooms.get(roomname) === undefined || this.branches.get(branchname) === undefined) {
		throw new Error("Undefined Branch or Room");
	}
	this.rooms.get(roomname).currentBranchName = branchname;
};

cleanGame.prototype.setStartRoom = function(roomname) {
	if (this.rooms.get(roomname) === undefined) {
		throw new Error("Undefined Room");
	}
	this.currentRoomName = roomname;
};

cleanGame.prototype.addChoice = function(branch, id, choosable) {
	if (this.branches.get(branch) === undefined) {
		throw new Error("Undefined Branch");
	}
	this.branches.get(branch).choices[id] = new cleanChoice();
};

cleanGame.prototype.addChoiceRequired = function(branch, id, required) {
	if (this.branches.get(branch) === undefined) {
		throw new Error("Undefined Branch");
	}
	if (this.branches.get(branch).choices[id] === undefined) {
		throw new Error("Undefined Choice");
	}
	var c = this.branches.get(branch).choices[id];
	if (!Array.isArray(required)) {
		required = [required];
	}
	c.requiredItemNames.push(required);
};

cleanGame.prototype.addChoiceForbidden = function(branch, id, forbidden) {
	if (this.branches.get(branch) === undefined) {
		throw new Error("Undefined Branch");
	}
	if (this.branches.get(branch).choices[id] === undefined) {
		throw new Error("Undefined Choice");
	}
	var c = this.branches.get(branch).choices[id];
	if (!Array.isArray(forbidden)) {
		forbidden = [forbidden];
	}
	c.forbiddenItemNames.push(forbidden);
};

cleanGame.prototype.addEffectItem = function(branch, choiceids, itemname, itemvisible) {
	if (this.branches.get(branch) === undefined) {
		throw new Error("Undefined Branch");
	}
	var e = new cleanEffect();
	var newitem = new cleanItem(itemname, Boolean(itemvisible));
	e.gotItems.push(newitem);
	e.addToChoices(choiceids, this.branches.get(branch));
};

cleanGame.prototype.addEffectRemoveItem = function(branch, choiceids, remove) {
	if (this.branches.get(branch) === undefined) {
		throw new Error("Undefined Branch");
	}
	var e = new cleanEffect();
	e.removeItemNames = e.removeItemNames.concat(remove);
	e.addToChoices(choiceids, this.branches.get(branch));
};

cleanGame.prototype.addEffectBranch = function(branch, choiceids, room, tobranch) {
	if (this.branches.get(branch) === undefined) {
		throw new Error("Undefined Branch");
	}
	if (this.rooms.get(room) === undefined) {
		throw new Error("Undefined Room");
	}
	var e = new cleanEffect();
	e.roomName = room;
	e.roomNewBranchName = tobranch;
	e.addToChoices(choiceids, this.branches.get(branch));
};

cleanGame.prototype.addEffectLeaveRoom = function(branch, choiceids) {
	if (this.branches.get(branch) === undefined) {
		throw new Error("Undefined Branch");
	}
	var e = new cleanEffect();
	e.playerLeaveRoom = true;
	e.addToChoices(choiceids, this.branches.get(branch));
};

cleanGame.prototype.addEffectEnterRoom = function(branch, choiceids) {
	if (this.branches.get(branch) === undefined) {
		throw new Error("Undefined Branch");
	}
	var e = new cleanEffect();
	e.playerEnterRoom = true;
	e.addToChoices(choiceids, this.branches.get(branch));
};
