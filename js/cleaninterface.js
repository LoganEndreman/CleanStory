// File for Interface with the HTML
//

// Global callback
var cleanChoiceCallback = function(choiceid) {return false;};

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
}

cleanMapArea.prototype.update = function(game) {
	game;	
}

function cleanInterface(gameobj, textdivid, mapdivid) {
	this.game = gameobj
	this.textArea = new cleanTextArea(textdivid);
	this.mapArea = new cleanMapArea(mapdivid);
	var that = this
	cleanChoiceCallback = function(choiceid) {
		that.makeChoice(choiceid);
		return false;
	};
}

cleanInterface.prototype.expandMap = function() {

}

cleanInterface.prototype.contractMap = function() {

}

cleanInterface.prototype.update = function() {
	// get state
	if (this.game.currentRoomName === undefined) {
		this.expandMap();
		this.mapArea.update(this.game);
	} else {
		this.contractMap();
		// Add the current text
		this.textArea.update(this.game, this.game.read());
	}
};

cleanInterface.prototype.makeChoice = function(choiceid) {
	this.game.makeChoice(choiceid);
	this.update();	
};

// Run the story
cleanInterface.prototype.runGame = function() {
	this.update();
};
