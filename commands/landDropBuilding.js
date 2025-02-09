const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

function calculate(race, cityType, leftoverBuildings, cityPage) {
  var buildingLeftExtracted = cityPage.match(/space for\s*(\d+)\s*more buildings/);
  var buildingsLeft = buildingLeftExtracted ? parseInt(buildingLeftExtracted[1], 10) : 0;

  var extractedBuiltHomes = cityPage.match(/Homes[\s\S]*?Built:\s*(\d+)/);
  var builtHomes = extractedBuiltHomes ? parseInt(extractedBuiltHomes[1], 10) : 0;

  var extractedBuiltMines = cityPage.match(/Mines[\s\S]*?Built:\s*(\d+)/);
  var builtMines = extractedBuiltMines ? parseInt(extractedBuiltMines[1], 10) : 0;

  var extractedBuiltLumbermills = cityPage.match(/Lumbermills[\s\S]*?Built:\s*(\d+)/);
  var builtLumbermills = extractedBuiltLumbermills ? parseInt(extractedBuiltLumbermills[1], 10) : 0;

  var extractedBultFarms = cityPage.match(/Farms[\s\S]*?Built:\s*(\d+)/);
  var builtFarms = extractedBultFarms ? parseInt(extractedBultFarms[1], 10) : 0;

  var extractedBuiltArmories = cityPage.match(/Armories[\s\S]*?Built:\s*(\d+)/);
  var builtArmories = extractedBuiltArmories ? parseInt(extractedBuiltArmories[1], 10) : 0;

  var builtResourceBuildings = builtMines + builtLumbermills + builtFarms + builtArmories;
  var totalBuildings = builtHomes + builtResourceBuildings + buildingsLeft - leftoverBuildings; 

  var maxArmories = 7500;

  var resourceRatio = 5/6;
  var homesRatio = 1/6;

  if (race === "dwarf" && cityType === "mine") {
    resourceRatio = 72580/90000;
    homesRatio = 17420/90000;
  }

  var targetMines = cityType === "mine" ? Math.floor(totalBuildings * resourceRatio) - builtResourceBuildings : 0;
  var targetLumbermills = cityType === "lumber" ? Math.floor(totalBuildings * resourceRatio) - builtResourceBuildings : 0;
  var targetFarms = cityType === "farm" ? Math.floor(totalBuildings * resourceRatio) - builtResourceBuildings : 0;
  var targetArmories = cityType === "arms" ? Math.floor(totalBuildings * resourceRatio) - builtResourceBuildings : 0;
  var targetHomes = Math.ceil(totalBuildings * homesRatio) - builtHomes;

  if (cityType === "arms") {
    var adjustedArms = Math.min(targetArmories, maxArmories);
    targetHomes += targetArmories - adjustedArms;
    targetArmories = adjustedArms;
  } 
  
  return { "homes": targetHomes, "mines": targetMines , "lumbermills": targetLumbermills, "farms": targetFarms, "armories": targetArmories };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dropbuildcalc")
    .setDescription(
      "Calculate the number of buildings to do for standard single resource/armory land drops"
    )
    .addStringOption((option) =>
      option
        .setName("race")
        .setDescription("Race (human, elf, halfling, dwarf, orc, troll)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("citytype")
        .setDescription("City type (mine, farm, lumber, arms)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("leftoverbuildings")
        .setDescription("Buildings leftover after drop (for other buildings like MT, GT, etc)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("citypage")
        .setDescription("City page (copy paste all of city page)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const validRaces = ["human", "elf", "halfling", "dwarf", "orc", "troll"];
    const race = interaction.options.getString("buildings");

    if (!validRaces.includes(race)) {
      return await interaction.reply({ embeds: [`Please select a valid race (e.g, human, elf, halfling, dwarf, orc, troll)`], ephemeral: userChoice });
    }

    const validCityTypes = ["mine", "farm", "lumber", "arms"];
    const cityType = interaction.options.getString("citytype");

    if (!validCityTypes.includes(cityType)) {
      return await interaction.reply({ embeds: [`Please select a valid city type (e.g, mine, farm, lumber, arms)`], ephemeral: userChoice });
    }

    const leftoverBuildings = interaction.options.getInteger("leftoverbuildings");
    const cityPage = interaction.options.getString("citypage");

    let embedContent = [];

    let result = calculate(race, cityType, leftoverBuildings, cityPage);

    embedContent = `You have ${leftoverBuildings} buildings left over after your drop. \n\n
    You should build the following buildings: \n
    Homes: ${result.homes} \n
    Mines: ${result.mines} \n
    Lumbermills: ${result.lumbermills} \n
    Farms: ${result.farms} \n
    Armories: ${result.armories} \n`;

    const embed = new MessageEmbed()
      .setColor(2123412)
      .setTitle(
        `Land drop ${buildings} buildings - ${interaction.user.username}`
      )
      .setDescription(embedContent)
      .setTimestamp();
    return await interaction.reply({ embeds: [embed], ephemeral: userChoice });
  },
};

// Uncomment the below code to test the function

/*console.log(calculate("human", "mine", 0, 
  `Valhalla
Karmic Forge
Choose city	Empl.	Prod.	Morale	Gates

Karmic Forge
100%	100%	100%	No gates


This city has 108851 peasants who are working as hard as they can.

There is space for 52213 more buildings and at this time we can build a maximum of 52213 structures or 1274 more walls.

It costs 1431 gold, 0 tree and 238 stone ( 1908 for walls) to build one building.

Each building can take up to a maximum of 26 days to build.



Homes
Houses 25 people.
Built:	4356	Build:
In construction:	0
Homes filled:	100%


Farms
Each farm produces around 11 food per day.
Built:	35	Build:
In construction:	0


Mines
Each mine produces around 15 gold per day and around 9 stone per day.
Built:	21780	Build:
In construction:	0


Lumbermills
Each lumbermill produces tree.
Built:	0	Build:
In construction:	0


Magic Towers
Will defend your city from magic and make it much easier for your wizards to cast long range spells.
Built:	0	Build:
In construction:	0


Guardtowers
Gives extra defence and increases line of sight.
Built:	1	Build:
In construction:	0


Taverne
Increases the morale in your city and the armies stationed in the city.
Built:	15	Build:
In construction:	0


Armories
Lowers training time and makes you able to train more troops in your colony.
Built:	0	Build:
In construction:	0


Warehouses
Stores one hundred times more resources than farms/mines/mills.
(All buildings can store an unlimited amount of resources)
Built:	0	Build:
In construction:	0


Walls
Increase the preparation time when attacking your colony.
Built:	0 / 1274	Build:
In construction:	0


Wreckages
When you destroy buildings they will become Wreckages and will disappear over time.
Wrecked buildings:	0

Destroy buildings	


In Construction
Days	1	2-9	10-19	20-39	40-59	60-100
Homes	0	0	0	0	0	0
Farms	0	0	0	0	0	0
Mines	0	0	0	0	0	0
Lumbermills	0	0	0	0	0	0
Magic Towers	0	0	0	0	0	0
Guardtowers	0	0	0	0	0	0
Taverne	0	0	0	0	0	0
Armories	0	0	0	0	0	0
Warehouses	0	0	0	0	0	0
Walls	0	0	0	0	0	0
- close -
  Copyright © 1999-2025 Visual Utopia. All rights reserved. Page loaded in 0.06 seconds. Server time: 10:01:10 AM`

)); */