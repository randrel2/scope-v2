const { SlashCommandBuilder } = require("@discordjs/builders");
const got = require("got");
module.exports = {
  data: new SlashCommandBuilder().setName("mom").setDescription("jokes"),
  async execute(interaction) {
    const data = await got.get("https://api.yomomma.info/").json();
    return await interaction.reply(data.joke);
  }
};
