const { SlashCommandBuilder, memberNicknameMention } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Bot with @ you with your message after X hours and Y minutes')
        .addIntegerOption(option =>
            option.setName('hours')
                .setDescription('Hours until reminder is sent')
                .setRequired(true),
        ).addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('Minutes until reminder is sent')
                .setRequired(true),
        ).addStringOption(option =>
            option.setName('noti')
                .setDescription('Reminder message contents')
                .setRequired(true),
        ),

    async execute(interaction) {

        // Grab current UNIX timestamp (timezone agnostic)
        const curTime = Date.now();

        // Recover user-entered times
        const minutes = Math.abs(interaction.options.getInteger('minutes'));
        const hours = Math.abs(interaction.options.getInteger('hours'));
        const message = interaction.options.getString('noti');
        const userID = interaction.user.id;
        const server = interaction.guild.id;
        const channel = interaction.channel.id;

        // If both are set to 0, error out
        if (minutes == 0 && hours == 0) {
            return interaction.reply({ content: '**Warning:** No reminder set, must enter a non-zero value for hours and/or minutes.', ephemeral: true });
        }

        // Convert minutes and hours to milliseconds
        const newTime = curTime + (minutes * 60 * 1000 + hours * 3600 * 1000);

        let newEntry = {"remindTime":newTime,"server":server,"channel":channel,"user":userID,"message":message,"hours":hours,"minutes":minutes};

        fs.readFile('./remindLog.json',function(err,content){
          if(err) throw err;
          var parseJson = JSON.parse(content);
           parseJson.remindData.push(newEntry)
          fs.writeFile('./remindLog.json',JSON.stringify(parseJson,null,1),function(err){
            if(err) throw err;
          })
        })

        const embedContent = `In **${hours} hour(s)** and **${minutes} minutes**:

        ${message}`;

        const embed = new MessageEmbed()
            .setColor(2123412)
            .setTitle(`Reminder set for ${interaction.user.username}`)
            .setDescription(embedContent);
        return interaction.reply({ embeds: [embed] });
    }
}