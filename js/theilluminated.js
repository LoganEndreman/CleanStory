// Example of a Implemented Game

var ig = new cleanGame();

ig.addRoom("The Office");
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
		"You eat the pancakes, and win.\n"+
		"Nice!\n"
	    );

// set up the implementation
var illim = new cleanInterface(ig, "gametext");

// run it
illim.runGame();
