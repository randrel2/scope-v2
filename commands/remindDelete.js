const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminddelete')
        .setDescription('Delete upcoming reminders. Run /list first.')
        .addIntegerOption(option =>
            option.setName('entry')
                .setDescription('Type the entry number to delete')
                .setRequired(true),
        ),

    async execute(interaction) {

        const deleteEntry = Math.abs(interaction.options.getInteger('entry'));
        let userIter = -1;
        let userEntries = [];

        // If both are set to 0, error out
        if (deleteEntry == 0) {
            return interaction.reply({ content: '**Warning:** No entries deleted, must enter a non-zero value.', ephemeral: true });
        }

        fs.readFile('./remindLog.json', function (err, content) {
            if (err) throw err;
            existData = JSON.parse(content);

            for (i = 0; i < existData.remindData.length; i++) {
                if (existData.remindData[i].user == interaction.user.id) {
                    userIter++;
                    userEntries[userIter] = i;
                }
            }

            if (userIter < 0) {
                return interaction.reply({ content: 'You have no active reminders, no entries deleted.', ephemeral: true });
            }

            if (deleteEntry > userEntries.length) {
                return interaction.reply({ content: 'Entered entry number does not exist, no entries deleted.', ephemeral: true });
            }

            console.log(deleteEntry);

            console.log(existData);

            let removeData = existData.remindData.splice(deleteEntry-1, 1);
            
            console.log(existData);

            fs.writeFile('remindLog.json', JSON.stringify(existData, null, 1), function (err) {
                if (err) throw err;
                console.log("RemindLog entry deleted by User. Database Updated.");
            })

            return interaction.reply({ content: `Deleted entry #${deleteEntry}, reminder successfully removed from scheduler.`, ephemeral: true });

        })
    }
}