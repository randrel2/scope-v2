const {
    SlashCommandBuilder,
    memberNicknameMention,
} = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reporterror")
        .setDescription(
            "Paste the message yielding errors, call this command, then send Percy what the bot sends back."
        )
        .addStringOption((option) =>
            option
                .setName("commandused")
                .setDescription("What command has the error?")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("description")
                .setDescription("Message describing whats wrong.")
                .setRequired(true)
        ),

    async execute(interaction, client) {

        // Get message with the erroneous data
        const channel = await interaction.channel.fetch();
		const messages = await channel.messages.fetch({ limit: 1 });
		const firstmessage = messages.keys().next().value;
		const messageContent = (messages.get(firstmessage)['content']);

        // Get user's error report message
        const description = interaction.options.getString("description");
        const commandUsed = interaction.options.getString("commandused");

        const errorLog = `User's description of the problem:
${description}
        
Real:
${messageContent}

Converted:
${new TextEncoder().encode(messageContent)}`

        const embed1 = new MessageEmbed()
            .setColor(2123412)
            .setTitle(`New Error from ${interaction.user.username} with "${commandUsed}".`)
            .setDescription(errorLog);

        

        client.guilds.cache.get('751880536238063728').channels.cache.get('765596263219462204').send({embeds: [embed1]});
        

        const embedContent = `You have successfully reported the error.`;
        const embed2 = new MessageEmbed()
            .setColor(2123412)
            .setTitle(`Error report submission.`)
            .setDescription(embedContent);
            
        return interaction.reply({ embeds: [embed2]});
    },
};
