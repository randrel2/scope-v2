const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { token, guilds, clientId } = require("./config.json");
const { Routes } = require("discord-api-types/v9");
const logger = require("./logger");
const { re } = require("mathjs");
const commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const register = async () => {
  try {
    console.log(`Started refreshing application (/) commands globally`);
    const rest = new REST({ version: "9" }).setToken(token);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log(`Successfully reloaded application (/) commands globally`);
  } catch (error) {
    console.log(`failed to refresh application (/) commands globally`);
    console.error(error);
  }
};
register();
