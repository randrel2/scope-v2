const numeral = require("numeral");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { log10 } = require("mathjs");

function prep(troops, citySize) {
    return (Math.round((Math.pow(troops, 0.3) * citySize) / 12 + 3));
}

function defenseCalc(maxPrep, attackOP, defendDP, GTDP) {

    // Takeover and Siege OP/DP ratios (relative to attacker)
    const maxRatio = [attackOP/(defendDP+GTDP),attackOP/defendDP];

    // Takeover and Siege Max Chance values
    const maxChance = [Math.round(100*(1 - 1 / (1 + Math.pow(10, 5 * log10(maxRatio[0]))))),Math.round(100*(1 - 1 / (1 + Math.pow(10, 5 * log10(maxRatio[1])))))];

    let TotAttackChance = [];
    let attackChance = [];
    let curRatio = [];

  // First iteration, full walls (double prep)
  for (j = 1; j <= (maxPrep*2); j++) {
    // Iterate through Remaining Prep to find %Chance at each tick
    for (i = 0; i <= 1; i++) {
      // OPDP based on current tick iteration
      curRatio = (maxRatio[i] * j) / (maxPrep*2);

      // Add current chance value to array of values
      attackChance[i] = Math.round(
        100 * (1 - 1 / (1 + Math.pow(10, 5 * log10(curRatio))))
      );
    }

    TotAttackChance.push([attackChance[0], attackChance[1]]);
  }

  let noWallChance = [];
  let TotNoWallChance = [];
  curRatio = [];

  // Second iteration, No Walls
  for (j = 1; j <= maxPrep; j++) {
    // Iterate through Remaining Prep to find %Chance at each tick
    for (i = 0; i <= 1; i++) {
      // OPDP based on current tick iteration
 
      curRatio = (maxRatio[i] * j) / (maxPrep);

      // Add current chance value to array of values
      noWallChance[i] = Math.round(
        100 * (1 - 1 / (1 + Math.pow(10, 5 * log10(curRatio))))
      );

      // Print array of chance values
    }

    // Push each iteration into new row
    TotNoWallChance.push([noWallChance[0], noWallChance[1]]);
  }

    let AttackWalls = [];
    let SiegeWalls = [];
    let NoWallAttack = [];
    let NoWallSiege = [];

    // Break each Full Wall array into individual components
    for (i = 0; i < (maxPrep*2); i++) {
        AttackWalls.push(TotAttackChance[i][0]);
    }

    // Break each No Wall array into individual components
    for (i = 0; i < maxPrep; i++) {
        NoWallAttack.push(TotNoWallChance[i][0]);
    }

    // Add '-' symbols for each tick after the No Wall max is reached
    for (j = i; j < (maxPrep*2); j++) {
        NoWallAttack.push(" - ");
    }

    // Break each Full Wall array into individual components
    for (i = 0; i < (maxPrep*2); i++) {
      SiegeWalls.push(TotAttackChance[i][1]);
    }

    // Break each No Wall array into individual components
    for (i = 0; i < maxPrep; i++) {
      NoWallSiege.push(TotNoWallChance[i][1]);
    }

    // Add '-' symbols for each tick after the No Wall max is reached
    for (j = i; j < (maxPrep*2); j++) {
      NoWallSiege.push(" - ");
    }

  var combine = [];

  // Combine all arrays into single table
  for (i = 0; i < (maxPrep*2); i++) {
    combine.push([
      AttackWalls[i],
      NoWallAttack[i],
      SiegeWalls[i],
      NoWallSiege[i],
    ]);
  }
  return [
    combine,
    AttackWalls,
    SiegeWalls,
    NoWallAttack,
    NoWallSiege,
    maxRatio,
    maxChance
  ];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("defend")
    .setDescription("Provides inverse attack report")
    .addIntegerOption((option) =>
      option
        .setName("attacktroopcount")
        .setDescription("# Attacking Troops")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("citysize")
        .setDescription("Visual city size")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("attackop")
        .setDescription("OP of attacker")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("defenddp")
        .setDescription("DP of city (NO GTS)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("gtdp")
        .setDescription("DP from GTs (NO TROOPS)")
        .setRequired(false)
    ),

  async execute(interaction) {

    const userChoice = interaction.options.getInteger("visible");
    const troops = interaction.options.getInteger("attacktroopcount");
    const citySize = interaction.options.getInteger("citysize");
    const attackOP = interaction.options.getInteger("attackop");
    const defendDP = interaction.options.getInteger("defenddp");
    const GTDP = interaction.options.getInteger("gtdp");

    const maxPrep = prep(troops,citySize);

    const allVals = defenseCalc(maxPrep, attackOP, defendDP, GTDP);
    
    let ticks = allVals[0];
    let attack = allVals[1];
    let siege = allVals[2];
    let attackNW = allVals[3];
    let siegeNW = allVals[4];
    let maxRatio = allVals[5];
    let maxChance = allVals[6];

    let aVal = [];
    let sVal = [];
    let aValNW = [];
    let sValNW = [];
    let chances = [];

    console.log(attack)

    chances.push(
      `City Size: *${numeral(citySize).format("0")}*
Attacking Troops: *${numeral(troops).format("0,0").replace(",", ".")}*
Max Prep (no walls): *${numeral(maxPrep).format("0")}*
Max Prep (full walls): *${numeral(maxPrep*2).format("0")}*
Attacker OP: *${numeral(attackOP).format("0,0").replace(",", ".")}*
Defender DP: *${numeral(defendDP).format("0,0").replace(",", ".")}*
GuardTower DP: *${numeral(GTDP).format("0,0").replace(",", ".")}*

**Enemy chances** over the remaining ticks:`
    );

    chances.push(
      `\`\`\`-------------------------\nT  | A+W | A-W | S+W | S-W\n-------------------------\n`
    );
    for (i = 0; i < attack.length; i++) {
      aVal = attack[i];
      sVal = siege[i];
      aValNW = attackNW[i];
      sValNW = siegeNW[i];

      if (aVal >= 0) {
        aVal = `${numeral(attack[i]).format("00")}%`;
      }

      if (sVal >= 0) {
        sVal = `${numeral(siege[i]).format("00")}%`;
      }

      if (aValNW >= 0) {
        aValNW = `${numeral(attackNW[i]).format("00")}%`;
      }

      if (sValNW >= 0) {
        sValNW = `${numeral(siegeNW[i]).format("00")}%`;
      }

      chances.push(
        `${numeral(i+1).format("00")}` +
          " | " +
          aVal +
          " | " +
          aValNW +
          " | " +
          sVal +
          " | " +
          sValNW +
          "\n"
      );
    }
    chances.push(
      `\nA+W|A-W: Attack chance w or w/o walls\nS+W|S-W: Siege chance w or w/o walls`
    );
    chances.push(`\`\`\``);

    const embed = new MessageEmbed()
      .setColor(2123412)
      .setTitle(`${interaction.user.username} - Inverse Prep Calculation`)
      .setDescription(
        chances.toString().replaceAll(",", "").replaceAll(".", ",")
      )
      .setTimestamp();
    return await interaction.reply({ embeds: [embed], ephemeral: userChoice });
  },
};
