const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const logger = require('./logger');
client.on('ready', () => logger.info('The bot is online'));
client.on('debug', m => logger.debug(m));
client.on('warn', m => logger.warn(m));
client.on('error', m => logger.error(m));
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}
client.once('ready', () => {
	console.log('Ready!');
});
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand() && !interaction.isButton()) return;
	if (interaction.isCommand()) {
		logger.info({
			command: interaction.commandName,
			server: interaction.member.guild.name + '|' + interaction.guildId,
			user:interaction.user.username + '#' + interaction.user.discriminator,
			options: interaction.options });
		console.log(interaction.options);
		const command = client.commands.get(interaction.commandName);
		if (!command) return;
		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
	if (interaction.isButton()) {
		logger.info('button clicked');
		return;
	}
});
client.login(token);

