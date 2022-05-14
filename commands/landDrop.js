const numeral = require("numeral");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { boolean } = require("mathjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dropcalc")
    .setDescription(
      "Estimate time until resources acquired for Land Drop assuming no market interaction."
    )
    .addIntegerOption((option) =>
      option
        .setName("buildings")
        .setDescription("# buildings to drop")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("goldcost")
        .setDescription("Gold cost per building")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("stonecost")
        .setDescription("Stone cost per building")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("woodcost")
        .setDescription("Wood cost per building")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("goldreserve")
        .setDescription("Current gold in reserve")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("stonereserve")
        .setDescription("Current stone in reserve")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("woodreserve")
        .setDescription("Current wood in reserve")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("goldprod")
        .setDescription("Takehome gold per hour")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("stoneprod")
        .setDescription("Stone production per hour")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("woodprod")
        .setDescription("Wood production per hour")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("stoneprice")
        .setDescription("Sale price of stone in market (0 if unused)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("visible")
        .setDescription("Show to all, or just you?")
        .setRequired(false)
        .addChoice("Just me", 1)
        .addChoice("Everyone", 0)
    ),

  async execute(interaction) {
    const buildings = interaction.options.getInteger("buildings");
    const goldCost = interaction.options.getInteger("goldcost");
    const stoneCost = interaction.options.getInteger("stonecost");
    const woodCost = interaction.options.getInteger("woodcost");
    const goldReserve = interaction.options.getInteger("goldreserve");
    const stoneReserve = interaction.options.getInteger("stonereserve");
    const woodReserve = interaction.options.getInteger("woodreserve");
    const goldProd = interaction.options.getInteger("goldprod");
    const stoneProd = interaction.options.getInteger("stoneprod");
    const woodProd = interaction.options.getInteger("woodprod");
    const stonePrice = interaction.options.getNumber("stoneprice")
      ? interaction.options.getNumber("stoneprice")
      : 0;

    const userChoice = interaction.options.getInteger("visible");

    let embedContent = [];

    const goldRem = buildings * goldCost - goldReserve;
    const stoneRem = buildings * stoneCost - stoneReserve;
    const woodRem = buildings * woodCost - woodReserve;

    const goldTick = Math.ceil(goldRem / goldProd);
    const stoneTick = Math.ceil(stoneRem / stoneProd);
    let woodTick = 0;
    if (woodProd == 0) {
      woodTick = "No wood Prod";
    } else {
      woodTick = Math.ceil(woodRem / woodProd);
    }

    if (stonePrice > 0 && stonePrice < 1) {
      if (goldTick - stoneTick > 0) {
        let stoneTot = 0;
        let newGold = 0;
        let goldCheck = 0;
        let i = 0;
        let outputLog = false;

        for (i = 1; i < goldTick; i++) {
          stoneTot = stoneRem - stoneProd * i;

          if (stoneTot < 0) {
            newGold = Math.abs(stoneTot * stonePrice);

            goldCheck = goldRem - newGold - goldProd * i;

            if (goldCheck < 0) {
              outputLog = true;

              embedContent = `**Resource | Tot Remaining | Ticks**
Gold: *${numeral(goldRem).format("0,0")} | ${goldTick}*
Stone: *${numeral(stoneRem).format("0,0")} | ${stoneTick}*
Wood: *${numeral(woodRem).format("0,0")} | ${woodTick}*
                        
**If all excess excess stone is sold...**
Gold: *${numeral(goldRem - newGold).format("0,0")} | ${i}*
~~Stone: ~~*~~${numeral(stoneTot).format("0,0")} | ${i}~~*
Wood: *${numeral(woodRem).format("0,0")} | ${woodTick}*
                        
Strikethrough is sold amount and ticks worth of econ sold.`;
              break;
            }
          }
        }

        if (outputLog == false) {
          embedContent = `**Resource | Tot Remaining | Ticks**
Gold: *${numeral(goldRem).format("0,0")} | ${goldTick}*
Stone: *${numeral(stoneRem).format("0,0")} | ${stoneTick}*
Wood: *${numeral(woodRem).format("0,0")} | ${woodTick}*

Error with stone calc. Excess stone detected, but loop could not close.`;
        }
      } else {
        embedContent = `**Resource | Tot Remaining | Ticks**
Gold: *${numeral(goldRem).format("0,0")} | ${goldTick}*
Stone: *${numeral(stoneRem).format("0,0")} | ${stoneTick}*
Wood: *${numeral(woodRem).format("0,0")} | ${woodTick}*
        
Stone market sales not valid, not estimated to have surplus stone`;
      }
    } else {
      embedContent = `**Resource | Tot Remaining | Ticks**
Gold: *${numeral(goldRem).format("0,0")} | ${goldTick}*
Stone: *${numeral(stoneRem).format("0,0")} | ${stoneTick}*
Wood: *${numeral(woodRem).format("0,0")} | ${woodTick}*
        
Stone sales not added due to non-entry or outside of 0-1 range.`;
    }

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
