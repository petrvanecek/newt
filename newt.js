// commands/newt.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newt')
        .setDescription('Simulátor planetárních systémů'),
    async execute(interaction) {
        await interaction.reply('Welcome to the Newt command! Please use subcommands like `/newt create` or `/newt add`');
    },
};