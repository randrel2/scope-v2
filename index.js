const fs = require('fs');
require('dotenv').config();
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const logger = require('./logger');
const { channel } = require('diagnostics_channel');
let runOnce = false;
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

	var cron = require('node-cron');
	var task = cron.schedule('*/15 * * * * *', () => {

		const fs = require("fs");

		// Read users.json file
		fs.readFile("remindLog.json", function (err, data) {

			// Check for errors
			if (err) throw err;

			var existData = JSON.parse(data);

			// Grab current UNIX timestamp (timezone agnostic)
			const curTime = Date.now();

			// Converting to JSON
			let deleteLog = [];
			let deleteIter = 0;
			let listingChange = false;

			for (i = 0; i < existData.remindData.length; i++) {
				var remindTime = existData.remindData[i].remindTime;
				var server = existData.remindData[i].server;
				var channel = existData.remindData[i].channel;
				let userID = existData.remindData[i].user;
				var message = existData.remindData[i].message;
				var hours = existData.remindData[i].hours;
				var minutes = existData.remindData[i].minutes;

				if (remindTime <= curTime) {
					let notify = `<@!${userID}>: ${message}
			
Reminder set ${hours} hour(s) and ${minutes} minutes ago.`;

					//Send message to user channel they requested from
					client.channels.cache.get(channel.toString()).send(notify);
					deleteLog[deleteIter] = i;
					deleteIter++;

					listingChange = true;

				}
			}

			if (listingChange === true) {
				// Remove deleted rows from Array
				for (i = deleteLog.length - 1; i > -1; i--) {

					listingChange = true;

					let removeData = existData.remindData.splice(deleteLog[i], 1);
					console.log("PRUNED REMINDLOG ENTRY");
				}


				fs.writeFile('remindLog.json', JSON.stringify(existData, null, 1), function (err) {
					if (err) throw err;
					console.log('Updated remind database.');
				})
			}
		});
	});

	task.start();
});
client.on('interactionCreate', async interaction => {
	if (runOnce !== true) {

	}
	if (!interaction.isCommand() && !interaction.isButton()) return;
	if (interaction.isCommand()) {
		logger.info({
			command: interaction.commandName,
			server: interaction.member.guild.name + '|' + interaction.guildId,
			user: interaction.user.username + '#' + interaction.user.discriminator,
			options: interaction.options
		});
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

client.login(process.env.token);

const http = require('http');

const requestListener = function(req, res) {
    res.writeHead(200);
    res.end('Scope isn\'t a webserver, but heroku is picky without one');
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT);

