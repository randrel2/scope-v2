const { SlashCommandBuilder } = require('@discordjs/builders');
const { creator } = require('../config.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('prune')
		.setDescription('Prune up to 99 messages.')
		.addIntegerOption(option => option.setName('amount').setDescription('Number of messages to prune')),
	async execute(interaction) {
		const amount = interaction.options.getInteger('amount');
		if (!(interaction.memberPermissions.has('MANAGE_MESSAGES') != true || creator)) {
			return interaction.reply({ content: 'You do not have permission to purge messages in this channel.', ephemeral: true });
		}
		if (amount < 1 || amount > 100) {
			return interaction.reply({ content: 'You need to input a number between 1 and 99.', ephemeral: true });
		}
		await interaction.channel.bulkDelete(amount, true).catch(error => {
			console.error(error);
			interaction.reply({ content: 'There was an error trying to prune messages in this channel!', ephemeral: true });
		});

		return interaction.reply({ content: `Successfully pruned \`${amount}\` messages.`, ephemeral: true });
	},
};