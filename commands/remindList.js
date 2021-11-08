const { SlashCommandBuilder, memberNicknameMention } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remindlist')
        .setDescription('List upcoming reminders you have set'),

    async execute(interaction) {

        // Grab current UNIX timestamp (timezone agnostic)
        const curTime = Date.now();
        var existData = [];
        let embedContent = [];
        var timeDif = [];
        var hours = [];
        var minutes = [];
        var noti = [];
        let i = 0;

        fs.readFile('./remindLog.json', function (err, content) {
            if (err) throw err;
            existData = JSON.parse(content);

            for (i = 0; i < existData.remindData.length; i++) {
                if (existData.remindData[i].user == interaction.user.id) {
                    timeDif = (existData.remindData[i].remindTime - curTime) / 1000;
                    hours = Math.floor(timeDif / 3600);  // convert hours to milliseconds
                    minutes = Math.floor((timeDif - 3600 * Math.floor(timeDif / 3600)) / 60); // take remainder of hours, convert to minutes
                    noti = existData.remindData[i].message;

                    if (hours == 0 && minutes == 0) {
                        embedContent.push(`[${i + 1}]: **Less than 1 minute**\n*${noti}*.\n`);
                    } else {
                        embedContent.push(`[${i + 1}]: **${hours} hours and ${minutes} minutes**\n*${noti}*.\n`);
                    }
                }
            }

            if (i == 0) {
                embedContent.push(`No reminders have been set.\nUse /remind to set a new reminder.`)
            }


            const embed = new MessageEmbed()
                .setColor(2123412)
                .setTitle(`Reminder List Requested for: ${interaction.user.username}`)
                .setDescription(embedContent.toString().replaceAll(",", ""))
            return interaction.reply({ embeds: [embed], ephemeral: true });
        })
    }
}