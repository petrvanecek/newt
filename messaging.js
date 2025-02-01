const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

async function sendEmbed(message, color, title, description, footer, image) {
    const embed = new EmbedBuilder()
    .setColor(color) 
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
    if (footer) {
        embed.setFooter(footer); 
    }

    if (image) {
        const attachment = new AttachmentBuilder(image, { name: 'preview.png' });
        embed.setImage('attachment://preview.png')
        await message.reply({ embeds: [embed], files: [attachment] });
    } else {
        await message.reply({ embeds: [embed] });
    }    
}


async function sendErrorEmbed(message, errorTitle, errorMessage, footer) {
    sendEmbed(message, '#FF0000', errorTitle, errorMessage, footer)
}

async function sendInfoEmbed(message, title, description, footer) {
    sendEmbed(message, '#0000FF', title, description, footer)
}

async function sendResponseEmbed(message, title, description, footer, image) {
    sendEmbed(message, '#00FF00', title, description, footer, image)
}

module.exports = { sendErrorEmbed, sendInfoEmbed, sendResponseEmbed, sendEmbed };