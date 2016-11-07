// Example of a Implemented Game

var ig = new cleanGame();

ig.addIcon("tmpimg/empty.png",0);
ig.addIcon("tmpimg/plus.png",1);
ig.addIcon("tmpimg/tree.png",2);
ig.addIcon("tmpimg/x.png",3);
ig.setPlayerIcon("tmpimg/player.png");

ig.addMap("main",
	[
	[2,2,2,2,2,2,2,2,2],
	[2,2,0,0,0,2,2,0,2],
	[2,0,3,0,2,2,0,0,2],
	[2,0,2,2,2,0,0,2,2],
	[2,0,0,0,0,0,2,2,2],
	[2,2,2,0,2,2,2,2,2],
	[2,1,0,0,0,0,2,0,2],
	[2,2,0,0,2,0,0,0,2],
	[2,2,2,2,2,2,2,2,2]
	]
	 , [0,1,3]);

ig.addRoom("The Office", {x:2, y:2, map:"main"});
ig.setStartRoom("The Office");

ig.addBranch("Intro",
`<p>You have {0}2 great choices{/0}{1}2 ok choices and one AMAZING choice{/1} to choose from!</p>
<ul>
{2}<li>Bacon</li>{/2}
{3}<li>Eggs</li>{/3}
{0}{2}<li>No but really bacon
You should choose bacon</li>{/2}{/0}
{4}<li>OR PANCAKES!</li>{/4}
</ul>`);

ig.setRoomBranch("The Office", "Intro"); 
ig.addChoice("Intro", 0, false);
ig.addChoice("Intro", 1, false);
ig.addChoice("Intro", 2, true);
ig.addChoice("Intro", 3, true);
ig.addChoice("Intro", 4, true);
ig.addChoiceForbidden("Intro", 0, "sawpancakes");
ig.addChoiceRequired("Intro", 1, "sawpancakes");
ig.addChoiceRequired("Intro", 4, "sawpancakes");
ig.addEffectItem("Intro", [2,3], "sawpancakes", false);
ig.addEffectBranch("Intro", [2,3], "The Office", "But Wait");
ig.addEffectBranch("Intro", 4, "The Office", "Finish");

ig.addBranch("But Wait",
`<b>Wait!</b> In the corner!<br>
Before you choose, you notice a pile of delicious Pancakes.
<p>{0}Go back{/0}</p>`);

ig.addChoice("But Wait", 0, true);
ig.addEffectBranch("But Wait", 0, "The Office", "Intro");

ig.addBranch("Finish",
`You eat the pancakes, and win.<br>
Nice!{0}<p>Go to map</p>{/0}`);
ig.addChoice("Finish", 0, true);
ig.addEffectLeaveRoom("Finish", 0);
ig.addEffectBranch("Finish", 0, "The Office", "Done Here");

ig.addBranch("Done Here",
`You ate pancakes here.<br>
Nice!`);

// set up the implementation
var illim = new cleanInterface(ig, "gametext", "gamemap");

// run it
illim.runGame();
