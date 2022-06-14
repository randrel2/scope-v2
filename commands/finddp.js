const numeral = require("numeral");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { log10 } = require("mathjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("finddp")
    .setDescription("Takes OP % chance, gives DP")
    .addIntegerOption((option) =>
      option.setName("op").setDescription("Attacking army OP").setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName("chance").setDescription("Attacker chances").setRequired(true)
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
    const OP = interaction.options.getInteger("op");
    const chance = interaction.options.getInteger("chance");
    const userChoice = interaction.options.getInteger("visible");

    let curRatio = Math.pow((chance/100) / (1 - (chance/100)), 0.2);

    let DP = OP / curRatio;

    const embedContent = `Attacker OP: *${numeral(OP).format('0,0')}*
OP/DP Ratio: *${Math.round(curRatio*100)/100}*
Current Chance: *${chance}%*

**Enemy DP: *${numeral(DP).format('0,0')}***`;

    const embed = new MessageEmbed()
      .setColor(2123412)
      .setTitle(`${interaction.user.username} - Find Defender DP`)
      .setDescription(embedContent);
    return await interaction.reply({ embeds: [embed], ephemeral: userChoice });
  },
};
