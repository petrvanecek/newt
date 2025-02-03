const { EmbedBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');

async function sendEmbed(interaction, color, title, description, image, ephemeral = true) {
    try {
        const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();

        const options = {
            embeds: [embed],
            flags: ephemeral ? MessageFlags.Ephemeral : undefined
        };

        if (image) {
            const attachment = new AttachmentBuilder(image, { name: 'preview.png' });
            embed.setImage('attachment://preview.png');
            options.files = [attachment];
        }

        //console.log(`Deferred: ${interaction.deferred}, Replied: ${interaction.replied}`);
        await interaction.reply(options);
    } catch (error) {
        console.error('Error sending embed:', error);
    }
}

async function sendErrorEmbed(message, errorTitle, errorMessage) {
    sendEmbed(message, '#FF0000', errorTitle, errorMessage)
}

async function sendInfoEmbed(message, title, description, image) {
    sendEmbed(message, '#0000FF', title, description, image)
}

async function sendResponseEmbed(message, title, description, image, ephemeral=false) {
    sendEmbed(message, '#00FF00', title, description, image)
}

module.exports = { sendErrorEmbed, sendInfoEmbed, sendResponseEmbed, sendEmbed };