

// Classes
//

// Player object
// holds player inventory
function cleanPlayer() {
	this.position = undefined;
	this.inventory = [];
	this.iconId = undefined;
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

function cleanTile() {
	this.description = undefined;
	this.position = undefined;
	this.seen = undefined;
	this.room = undefined;
	this.iconId = undefined;
	this.soundId = undefined;
	this.movable = false;
}

// Map object
function cleanMap(name) {
	this.name = name;
	//tiles[y][x]
	this.tiles = [[]];
}

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
	this.imageId = undefined;
	this.expireTimer = undefined;
	this.value = ""; // a string value that can be set to user input
}

function cleanEffect() {
	this.gotItems = []; // list of items player gets when choice is choosen
	this.removeItemNames = []; // list of item names that get removed when choice is choosen
	this.playerNewPosition = undefined; // new position for player
	this.roomName = undefined; // room to change
	this.roomNewBranchName = undefined; // branch for room
	this.roomNewPosition = undefined; // new position for room // TODO, dont forget to add a game method for this
}

cleanEffect.prototype.addToChoices = function(ids, branch) {
	if (!Array.isArray(ids)) {
		ids = [ids];
	}
	for (var i=0; i<ids.length; i++) {
		if (branch.choices[ids[i]] === undefined) {
			throw new Error("Undefined Choice");
		}
		var c = branch.choices[ids[i]];
		c.effects.push(this);
	}
}

cleanEffect.prototype.happen = function(player, rooms) {
	// remove items
	player.removeItems(this.removeItemNames);
	// add items
	player.addItems(this.gotItems);
	// move player
	if (this.playerNewPosition !== undefined) {
		player.position = this.playerNewPosition;
	}	
	if (this.roomName !== undefined) {
		// change room branch
		if (this.roomNewBranchName !== undefined) {
			rooms[this.roomName].currentBranchName = this.roomNewBranchName;
		}
		// change room position
		if (this.roomNewPosition !== undefined) {
			rooms[this.roomName].position = this.roomNewPosition;
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

cleanChoice.prototype.makeChoice = function(player, rooms) {
	for (var e=0; e<this.effects.length; e++) {
		this.effects[e].happen(player, rooms);
	}
}

// Branch object
// for Story Logic
// holds text piece
function cleanBranch(name, text) {
	// choice text should only be shown if they cooresponding choice is availible (have needed items, dont have forbidden)
	this.name = name;
	this.text = text; // string, with {0}clickable links{/0} matching choices
	this.choices = []; // array by choice id
	this.imageId = undefined;
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
	this.position = undefined;
	this.currentBranchName = undefined;
	this.iconId = undefined;
}

cleanRoom.prototype.setStartBranch = function(startbranch) {
	this.currentBranch = startbranch;
};

// Game object
// holds everything
function cleanGame() {
	this.turn = 0;
	this.icons = []; // array by id
	this.images = []; // array by id
	this.sounds = []; // array by id
	this.maps = {}; // object by name
	this.rooms = {}; // object by name
	this.branches = {}; // object by name
	this.currentRoomName = undefined;
	this.inRoom = true;
	this.player = new cleanPlayer();
}

cleanGame.prototype.getBranch = function() {
	var bname = this.rooms[this.currentRoomName].currentBranchName;
	if (this.branches[bname] === undefined) {
		throw new Error("Undefined Branch");
	}
	return this.branches[bname];
};

cleanGame.prototype.read = function() {
	// TODO read sends map stuff when in the map mode
	var br = this.getBranch();
	return br.read();
};

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
	choice.makeChoice(this.player, this.rooms);
};

cleanGame.prototype.addRoom = function(name) {
	if (this.rooms[name] !== undefined) {
		throw new Error("Room name taken");
	}
	var newroom = new cleanRoom(name);
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
