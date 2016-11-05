

// Classes
//

// Player object
// holds player inventory
function cleanPlayer() {
	this.hp = 100;
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

function cleanItem() {
	this.name = undefined;
	// visible items show up in the inventory, others are used as story boolean conditions between rooms
	this.visible = false;
	this.oneTimeUse = false;
	this.expireTimer = undefined;
}

// A choice in a branch, if choosen activates a branch and/or changes a players or room position
function cleanChoice() {
	// condition
	this.requiredItemNames = []; // list of item names
	this.forbiddenItemNames = []; // list of item names
	// activation
	this.gotItems = []; // list of items player gets when choice is choosen
	this.removeItems = [] // list of item names that get removed when choice is choosen
	this.playerNewPosition = undefined; // new position for player
	this.roomName = undefined; // room to change
	this.roomNewBranchName = undefined; // branch for room
	this.roomNewPosition = undefined; // new position for room
}

cleanChoice.prototype.addRequired = function(name) {
	this.requiredItemNames.push(name);
};

cleanChoice.prototype.addForbidden = function(name) {
	this.forbiddenItemNames.push(name);
};

cleanChoice.prototype.available = function(player) {
	var passed = true;
	for (var r=0; r<this.requiredItems.length; r++) {
		if (!player.hasItem(this.requiredItemNames[r])) {
			passed = false;
			break;
		}
	}
	for (var f=0; f<this.forbiddenItems.length; f++) {
		if (player.hasItem(this.forbiddenItemNames[f])) {
			passed = false;
			break;
		}
	}
	return passed;
};

cleanChoice.prototype.makeChoice = function(player, rooms) {
	// remove items
	for (var i=0; i<this.removeItems.length; i++) {
		for (var j=0; j<player.inventory.length; j++) {
			if (this.removeItems[i] == player.inventory[j].name) {
				player.inventory.splice(j,1);
				j--;
			}
		}
	}
	// add items
	player.inventory = player.inventory.concat(this.gotItems);
	// move player
	if (this.playerNewPosition !== undefined) {
		player.position = this.playerNewPosition;
	}	
	if (this.roomId !== undefined) {
		// change room branch
		if (this.roomNewBranchName !== undefined) {
			rooms[this.roomName].currentBranchName = this.roomNewBranchName;
		}
		// change room position
		if (this.roomNewPosition !== undefined) {
			rooms[this.roomName].position = this.roomNewPosition;
		}
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

cleanBranch.prototype.read = function(player) {
	return this.text;
};

cleanBranch.prototype.makeChoice = function(choiceid) {
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

cleanRoom.prototype.read = function(player) {
	return this.currentBranch.read(player);
};

cleanRoom.prototype.makeChoice = function(choiceid) {
	return this.currentBranch.makeChoice(choiceid);
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
	this.player = undefined;
}

cleanGame.prototype.read = function() {
	// TODO read sends map stuff when in the map mode
	return this.currentRoom.read(this.player);
};

cleanGame.prototype.makeChoice = function(choiceid) {
	choice = this.rooms[currentRoomName].makeChoice(choiceid, this.rooms);
}

cleanGame.prototype.addRoom = function(name) {
	var newroom = new cleanRoom(name);
	this.rooms[name] = newroom;
}

cleanGame.prototype.addBranch = function(name, text) {
	var newbranch = new cleanBranch(name, text);
	this.branches[name] = newbranch;
}

cleanGame.prototype.addChoice = function(branch, id, choice) {
	if (this.branches.branch === undefined) {
		throw new Error("Undefined Branch");
	}
	this.branches.branch.choices[id] = choice;
}

cleanGame.prototype.setRoomBranch(roomname, branchname) {
	if (this.rooms[roomname] === undefined || this.branches[branchname] === undefined) {
		throw new Error("Undefined Branch or Room");
	}
	this.rooms[roomname].currentBranchName = branchname;
}
