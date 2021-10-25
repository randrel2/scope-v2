const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const numeral = require('numeral');
const races = require('../resources/units');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('army')
		.setDescription('Provides the OPDP of given troops')
		.addStringOption(option =>
			option.setName('race')
				.setDescription('Race to calculate for')
				.setRequired(true)
				.addChoice('Orc', 'orc')
				.addChoice('Halfling', 'halfling')
				.addChoice('Elf', 'elf')
				.addChoice('Dwarf', 'dwarf')
				.addChoice('Human', 'human')
				.addChoice('Troll', 'troll'),
		).addIntegerOption(option =>
			option.setName('military')
				.setDescription('The military science level')
				.setRequired(true),
		).addIntegerOption(option =>
			option.setName('uone')
				.setDescription('numer of first Unit')
				.setRequired(true),
		).addIntegerOption(option =>
			option.setName('utwo')
				.setDescription('numer of second Unit')
				.setRequired(true),
		).addIntegerOption(option =>
			option.setName('uthree')
				.setDescription('numer of third Unit')
				.setRequired(true),
		).addIntegerOption(option =>
			option.setName('ufour')
				.setDescription('numer of fourth Unit')
				.setRequired(true),
		).addIntegerOption(option =>
			option.setName('ufive')
				.setDescription('numer of fifth Unit')
				.setRequired(true),
		).addIntegerOption(option =>
			option.setName('magic')
				.setDescription('The magic science level')
				.setRequired(false)
				.addChoice('0', 0)
				.addChoice('1', 1)
				.addChoice('2', 2)
				.addChoice('3', 3)
				.addChoice('4', 4)
				.addChoice('5', 5)
				.addChoice('6', 6)
				.addChoice('7', 7)
				.addChoice('8', 8)
				.addChoice('9+', 9),
		),
	async execute(interaction) {
		const military = interaction.options.getInteger('military');
		const magic = interaction.options.getInteger('magic') ? interaction.options.getInteger('magic') : 0;
		const race = interaction.options.getString('race');
		const u1 = interaction.options.getInteger('uone');
		const u2 = interaction.options.getInteger('utwo');
		const u3 = interaction.options.getInteger('uthree');
		const u4 = interaction.options.getInteger('ufour');
		const u5 = interaction.options.getInteger('ufive');
		const input = [u1, u2, u3, u4, u5];
		const units = races[race];
		let unit, op, dp, cost = 0;
		 for (u in input) {
			op = op + (u * units[u].op);
			dp = dp + (u * units[u].dp);
			cost = cost + (u * units[u].cost);
		}
		console.log(unit, op, dp, cost);
		const embed = new MessageEmbed()
			.setColor(2123412)
			.setTitle(`Army power calculation requested by  ${interaction.user.username}`)
			.setDescription('');
		return interaction.reply({ embeds: [embed] });
	},
};