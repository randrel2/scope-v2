const { SlashCommandBuilder } = require("@discordjs/builders");
const got = require('got');
module.exports = {
  data: new SlashCommandBuilder().setName("dad").setDescription("jokes"),
  async execute(interaction) {
    const {data} = await got.get('https://icanhazdadjoke.com/', {
  }).json();
    return await interaction.reply(data.joke);
  },
};
