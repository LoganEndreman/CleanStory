

// Classes
//

// Player object
// holds player stats: hp, inventory, etc 
function cleanPlayer() {
	this.hp = 100;
	this.inventory = [];
}

// Position object
function cleanPosition(x, y, mapid) {
	this.x = x;
	this.y = y;
	this.mapId = mapid;
}

function cleanTile() {
	this.position = undefined;
	this.seen = undefined;
	this.room = undefined;
	this.iconId = undefined;
	this.soundId = undefined;
}

// Map object
function cleanMap(id) {
	this.mapId = id;
	//tiles[y][x]
	this.tiles = [[]];
}

function cleanTimer() {
	this.on = false;
	this.startTurn = 0;
	this.endTurn = 0;
}

function cleanItem() {
	this.name = undefined;
	// visible items show up in the inventory, others are used as story boolean conditions between rooms
	this.visible = false;
	this.oneTimeUse = false;
	this.expireTimer = undefined;
}

function cleanChoice() {
	this.neededItems = [];
	this.branch = undefined;
}

// Branch object
// File for Story Logic
//

// holds text piece
function cleanBranch(text) {
	this.text = text;
	this.items  = [];
	this.choices = [];
	this.imageId = undefined;
	this.soundId = undefined;
}

// Room object
// holds text interaction
function cleanRoom() {
	this.position = undefined;
	this.currentBranch = undefined;
}

// Game object
// holds everything
function cleanGame() {
	this.turn = 0;
	this.icons = {};
	this.images = {};
	this.sounds = {};
}
