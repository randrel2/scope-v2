const numeral = require("numeral");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("merge")
    .setDescription(
      "Calculates how many troops you can to merge to get to a certain XP."
    )
    .addIntegerOption((option) =>
      option
        .setName("existing_troops")
        .setDescription("# of troops in the army")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("xp")
        .setDescription("Amount of XP in the army")
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
    const existingTroops = interaction.options.getInteger("existing_troops");
    const xp = interaction.options.getInteger("xp");
    const userChoice = interaction.options.getInteger("visible");
    const embedContent = [
      `**${existingTroops} troops with ${xp} XP**`,
      "```",
      "XP | # of troops to add",
      "----------------",
    ];
    for (let i = xp - 1; i > 0; i--) {
      const newTroops = Math.floor((existingTroops * xp) / i) - existingTroops;
      embedContent.push(
        `${numeral(i).format("00")} | ${numeral(newTroops).format("0,0")}`
      );
    }
    embedContent.push("```");
    const embed = new MessageEmbed()
      .setColor(2123412)
      .setTitle(`XP Merge calculation`)
      .setDescription(embedContent.join("\n"))
      .setTimestamp();
    return await interaction.reply({ embeds: [embed], ephemeral: userChoice });
  },
};
