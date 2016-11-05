// File for Interface with the HTML
//

// Objects
function cleanTextArea(div_id) {
	this.textArea = document.getElementById(div_id);
}

cleanTextArea.prototype.update = function(game, readtext) {
	// turn choices into links, and get rid of unavailable choices
	var front;
	var back;
	// parse out any unavailible choices
	front = readtext.indexOf('{');
	while (front !== -1) {
		var choiceid = +(readtext.slice(front+1,readtext.indexOf('}',front+1)));
		back = readtext.indexOf('{/', front);
		backback = readtext.indexOf('}', front+2);
		if (!game.choiceAvailable(choiceid)) {
			// remove this bit
			readtext = readtext.slice(0, front) + readtext.slice(backback+1);
		} else {
			// turn this part to a link
			readtext.replace(new RegExp('\\{'+ choiceid +'\\}', 'g'), '<a onclick="alert(\'click\');">');
			readtext.replace(new RegExp('\\{\\/'+ choiceid +'\\}', 'g'), '</a>');
		}
	}
	this.textArea.innerHTML += readtext;
};

function cleanMapArea(div_id) {

}

function cleanImageArea(div_id) {

}

function cleanInterface(gameobj, textdivid) {
	this.game = gameobj
	this.textArea = new cleanTextArea(textdivid);
}

cleanInterface.prototype.update = function() {
	// get state
	if (!this.game.inRoom) {
	}
	// Add the current text
	this.textArea.update(game, game.read());
};

// Run the story
cleanInterface.prototype.runGame = function() {
};
