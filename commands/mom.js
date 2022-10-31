const { SlashCommandBuilder } = require("@discordjs/builders");
const got = require("got");
const { jokes } = require("../resources/mamajokes.js");
module.exports = {
  data: new SlashCommandBuilder().setName("mom").setDescription("jokes"),
  async execute(interaction) {
    const sortedCategories = Object.keys(jokes).sort();
    var category =
      jokes[
        sortedCategories[Math.floor(Math.random() * Object.keys(jokes).length)]
      ];
    const joke = category[Math.floor(Math.random() * category.length)];
    return await interaction.reply(joke);
  }
};
