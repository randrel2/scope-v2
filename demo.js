const string = `
Through the eye we can see this information about Arrakis, owned by Conqueror Nocturnus:
Gaia:3602
Hammerthrowers:850
Ogres:0
Shamans:0
Nazguls:0
Peasants:31746
Wreckages:0
Homes:9027
Farms:2465
Mines:11751
Magic Towers:0
Guard Towers:2000
Taverne:15
Lumber Mills:3555
Armories:0
Warehouses:0
Walls:1100

Armies in the city: 0(Total of 0 men)`;
const races = require('../resources/units');
function raceIdentify(i) {
	const words = i.toString();
	if (words.search('Catapults') > 0) {
		return 'human';
	}
	else if (words.search('Archmages') > 0) {
		return 'elf';
	}
	else if (words.search('Nazguls') > 0) {
		return 'orc';
	}
	else if (words.search('Cavemasters') > 0) {
		return 'dwarf';
	}
	else if (words.search('Berserkers') > 0) {
		return 'troll';
	}
	else if (words.search('Adventurers') > 0) {
		return 'halfling';
	}
	else {
		return 'Error';
	}
}
let op = 0;
let endCut = -5, startCut = -5;
let dp = 0;
const cost = 0;
const military = 0;
const magic = 0;
const units = [];
let rawUnits = 0;
let GTs = 0;
let MTs = 0;
let extraArmies = 0;
let extraTroops = 0;
let Type = 'N/A', interm = 'N/A', Owner = 'N/A', Target = 'N/A', startTarget = 'N/A', endTarget = 'N/A', startOwner = 'N/A', endOwner = 'N/A';

let argArray = string.toString().split('\n').toString().split(',');
// Determine starting and ending cuts
for (let i = 0; i < argArray.length; i++) {
	if (argArray[i] === 'When' && argArray[i + 1] === 'casting' && argArray[i + 2] === 'the') {
		endCut = i - 1;
	}

	if (argArray[i] === 'Through' && argArray[i + 1] === 'the' && argArray[i + 2] === 'eye') {
		startCut = i;
	}
}

// if no cut is detected, default to starting and ending locations
if (startCut === -5) {
	startCut = 0;
}

if (endCut === -5) {
	endCut = argArray.length;
}

// parse input data according to above
argArray = argArray.slice(startCut, endCut);

if (argArray.length < 30) {
	// city === false, army === true
	Type = true;
	rawUnits = argArray.slice(argArray.length - 6, argArray.length).toString().replace('Pony,riders', 'Pony riders').toString().split(':').toString().split(',');
	rawNames = argArray.slice(0, argArray.length - 6).toString().replace(':', ',').split(',');
	intermNames = rawNames.slice(rawNames.indexOf('') + 1, rawNames.length);
	Target = intermNames.slice(0, intermNames.indexOf('from')).join(' ');
	Owner = intermNames.slice(intermNames.indexOf('from') + 1, intermNames.length).join(' ');
}
// City EITS reports
else {
// city === false, army === true
	Type = false;
	argArray = argArray.toString().replace(':', ',').split(',');
	startTarget = argArray.indexOf('about');
	endTarget = argArray.indexOf('');
	Target = argArray.slice(startTarget + 1, endTarget).join(' ');
	startOwner = argArray.indexOf('by');
	endOwner = argArray.indexOf('', startOwner);
	Owner = argArray.slice(startOwner + 1, endOwner).join(' ');
	rawUnits = argArray.slice(endOwner + 1, endOwner + 7).toString().replace('Pony,riders', 'Pony riders').toString().split(':').toString().split(',');

	GTs = argArray.slice(endOwner + 13, endOwner + 15).toString().replace('Guard,Towers:', 'Guard Towers:').split(':')[1];
	MTs = argArray.slice(endOwner + 11, endOwner + 13).toString().replace('Magic,Towers:', 'Magic Towers:').split(':')[1];
	extraArmies = argArray.slice(argArray.indexOf('city:') + 1, argArray.indexOf('city:') + 2).toString().split('(')[0];
	extraTroops = argArray.slice(argArray.lastIndexOf('') - 2, argArray.lastIndexOf('') - 1);
	rawUnits.push('GTs', GTs);
}


for (i = 0; i < (rawUnits.length / 2); i++) {
	units[i] = rawUnits[(i * 2) + 1];
}

console.log(rawUnits);
// Identifies Race
const raceName = raceIdentify(rawUnits);
const race = races[raceName];

// Handles elf mess
if (raceName === 'elf') {
	const mag = magic > 9 ? 9 : magic;
	race.u5.op = mag * 3;
	race.u5.dp = mag * 3;
}
// calculates Raw Unit OP/DP & Cost
for (i = 1; i < 8; i++) {
	const unitI = 'u'.concat(i);
	if (i < 7) {
		// units are base 0, so subtract 1
		/* op = isNaN(units[i - 1]) ? op : op + units[i - 1] * race[unitI].op;
		dp = isNaN(units[i - 1]) ? dp : dp + units[i - 1] * race[unitI].dp;
		cost = isNaN(units[i - 1]) ? cost : cost + units[i - 1] * race[unitI].cost;
	 */
	}
}
op = military ? op * (1 + military / 10) : op;
dp = military ? dp * (1 + military / 10) : dp;
dp = units[6] > 0 ? dp + units[6] * (5 + parseInt(military)) : dp; // likewise, 6 would be GTs now, not 7

