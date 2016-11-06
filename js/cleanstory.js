

// Classes
//

// Player object
// holds player inventory
function cleanPlayer() {
	this.iconPath = undefined;
	this.position = undefined;
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

function cleanTile(iconpath) {
	this.iconPath = iconpath;
	this.soundId = undefined;
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

function cleanTimer() {
	this.on = false;
	this.startTurn = 0;
	this.duration = 0;
}

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
	if (this.playerLeaveRoom === true) {
		game.player.position = game.rooms[game.currentRoomName].position;
		game.currentRoomName = undefined;
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
			game.rooms[this.roomName].active = true;
		}
		if (this.deactivate) {
			game.rooms[this.roomName].active = false;
		}
		// change room branch
		if (this.roomNewBranchName !== undefined) {
			game.rooms[this.roomName].currentBranchName = this.roomNewBranchName;
		}
		// change room position
		if (this.roomNewPosition !== undefined) {
			game.rooms[this.roomName].position = this.roomNewPosition;
			game.updateOverRoom();
		}
	}
};

// A choice in a branch, if choosen activates a branch and/or changes a players or room position
function cleanChoice() {
	// condition
	this.requiredItemNames = []; // list of item names
	this.forbiddenItemNames = []; // list of item names
	// activation
	this.effects = [];
}

cleanChoice.prototype.available = function(player) {
	var passed = true;
	for (var r=0; r<this.requiredItemNames.length; r++) {
		if (!player.hasItem(this.requiredItemNames[r])) {
			passed = false;
			break;
		}
	}
	for (var f=0; f<this.forbiddenItemNames.length; f++) {
		if (player.hasItem(this.forbiddenItemNames[f])) {
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
	// if you want an image, just embbed an image tag in your text
	this.soundId = undefined;
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
	this.effectsOnOver = [];
	this.effectsOnOut = [];
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

cleanGame.prototype

cleanGame.prototype.getBranch = function() {
	// get current room branch, if there, otherwise overroom branch
	var bname = undefined;
	if (this.currentRoomName !== undefined) {
		bname = this.rooms[this.currentRoomName].currentBranchName;
	} else if (this.overRoomName !== undefined) {
		bname = this.rooms[this.overRoomName].currentBranchName;
	} else {
		throw new Error("Tried to get a branch, when in map mode");
	}
	return this.branches[bname];
};

cleanGame.prototype.read = function() {
	var br = this.getBranch();
	return br.read();
};

cleanGame.prototype.updateOverRoom = function() {
	// see if there is an active room where the player is
	// TODO
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
	if (this.rooms[name] !== undefined) {
		throw new Error("Room name taken");
	}
	var newroom = new cleanRoom(name);
	newroom.position = new cleanPosition(pos.x, pos.y, pos.map);
	this.rooms[name] = newroom;
};

cleanGame.prototype.addBranch = function(name, text) {
	if (this.branches[name] !== undefined) {
		throw new Error("Branch name taken");
	}
	var newbranch = new cleanBranch(name, text);
	this.branches[name] = newbranch;
};

cleanGame.prototype.setRoomBranch = function(roomname, branchname) {
	if (this.rooms[roomname] === undefined || this.branches[branchname] === undefined) {
		throw new Error("Undefined Branch or Room");
	}
	this.rooms[roomname].currentBranchName = branchname;
};

cleanGame.prototype.setStartRoom = function(roomname) {
	if (this.rooms[roomname] === undefined) {
		throw new Error("Undefined Room");
	}
	this.currentRoomName = roomname;
};

cleanGame.prototype.addChoice = function(branch, id, choosable) {
	if (this.branches[branch] === undefined) {
		throw new Error("Undefined Branch");
	}
	this.branches[branch].choices[id] = new cleanChoice();
};

cleanGame.prototype.addChoiceRequired = function(branch, id, required) {
	if (this.branches[branch] === undefined) {
		throw new Error("Undefined Branch");
	}
	if (this.branches[branch].choices[id] === undefined) {
		throw new Error("Undefined Choice");
	}
	var c = this.branches[branch].choices[id];
	c.requiredItemNames = c.requiredItemNames.concat(required);
};

cleanGame.prototype.addChoiceForbidden = function(branch, id, forbidden) {
	if (this.branches[branch] === undefined) {
		throw new Error("Undefined Branch");
	}
	if (this.branches[branch].choices[id] === undefined) {
		throw new Error("Undefined Choice");
	}
	var c = this.branches[branch].choices[id];
	c.forbiddenItemNames = c.forbiddenItemNames.concat(forbidden);
};

cleanGame.prototype.addEffectItem = function(branch, choiceids, itemname, itemvisible) {
	if (this.branches[branch] === undefined) {
		throw new Error("Undefined Branch");
	}
	var e = new cleanEffect();
	var newitem = new cleanItem(itemname, Boolean(itemvisible));
	e.gotItems.push(newitem);
	e.addToChoices(choiceids, this.branches[branch]);
};

cleanGame.prototype.addEffectRemoveItem = function(branch, choiceids, remove) {
	if (this.branches[branch] === undefined) {
		throw new Error("Undefined Branch");
	}
	var e = new cleanEffect();
	e.removeItemNames = e.removeItemNames.concat(remove);
	e.addToChoices(choiceids, this.branches[branch]);
};

cleanGame.prototype.addEffectBranch = function(branch, choiceids, room, tobranch) {
	if (this.branches[branch] === undefined) {
		throw new Error("Undefined Branch");
	}
	if (this.rooms[room] === undefined) {
		throw new Error("Undefined Room");
	}
	var e = new cleanEffect();
	e.roomName = room;
	e.roomNewBranchName = tobranch;
	e.addToChoices(choiceids, this.branches[branch]);
};

cleanGame.prototype.addEffectLeaveRoom = function(branch, choiceids) {
	if (this.branches[branch] === undefined) {
		throw new Error("Undefined Branch");
	}
	var e = new cleanEffect();
	e.playerLeaveRoom = true;
	e.addToChoices(choiceids, this.branches[branch]);
};

cleanGame.prototype.addEffectEnterRoom = function(branch, choiceids) {
	if (this.branches[branch] === undefined) {
		throw new Error("Undefined Branch");
	}
	var e = new cleanEffect();
	e.playerEnterRoom = true;
	e.addToChoices(choiceids, this.branches[branch]);
};
