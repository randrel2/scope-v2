const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const numeral = require("numeral");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Does basic math operations, rounded to 2 decimal places')
        .addNumberOption(option =>
            option.setName('first')
                .setDescription('First item')
                .setRequired(true),
        ).addStringOption(option =>
            option.setName('operator')
                .setDescription('Choose desired operation')
                .setRequired(true)
				.addChoice('+', '+')
				.addChoice('-', '-')
				.addChoice('*', '*')
				.addChoice('/', '/'),
        ).addNumberOption(option =>
            option.setName('second')
                .setDescription('Second item')
                .setRequired(true),
        ).addStringOption(option =>
            option.setName('title')
                .setDescription('Add title for bot output')
                .setRequired(false),
        ),

    async execute(interaction) {

        let firstNum = interaction.options.getNumber('first');
        let operator = interaction.options.getString('operator');
        let secondNum = interaction.options.getNumber('second');
        let title = interaction.options.getString('title') ? interaction.options.getString('title') : 'Quick Calculation';
        let answer = 0;

        if(operator === '+'){
            answer = Math.round((firstNum + secondNum)*100)/100;
        }else if(operator === '-'){
            answer = Math.round((firstNum - secondNum)*100)/100;
        }else if(operator === '*'){
            answer = Math.round((firstNum * secondNum)*100)/100;
        }else{
            answer = Math.round((firstNum / secondNum)*100)/100;
        }

        const embedContent = `\`\`\`${firstNum} ${operator} ${secondNum} = ${answer}\`\`\``;

        const embed = new MessageEmbed()
            .setColor(2123412)
            .setTitle(title)
            .setDescription(embedContent);
        return interaction.reply({ embeds: [embed] });
    }
};
