const { SlashCommandBuilder, Interaction } = require('discord.js');
const { setHomeSystem, getHomeSystem, isValidOption } = require('../utils.js');
const { sendErrorEmbed, sendResponseEmbed, sendInfoEmbed, sendEmbed } = require('../messaging');
const mongoose = require('mongoose');
const User = require('../models/User');
const System = require('../models/System');
const Body = require('../models/body');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newt')
        .addSubcommand(subcommand =>
            subcommand
                .setName('vytvoř')
                .setDescription('Vytvoří nový planetární systém a vygeneruje system-id.')
                .addStringOption(option => option.setName('název').setDescription('Jméno systému').setRequired(true))
        ),
    /**
     * 
     * @param {Interaction} interaction 
     * @param {Array<String>} args 
     * @returns 
     */
    async execute(interaction) {
        let args = []
        try {
            if(!isValidOption(interaction, 'název')) {
                sendErrorEmbed(interaction, `Chybné parametry`, `Přečti si nápovědu.`)
                return
            }
        
            const systemName = interaction.options.get('název').value
            const newSystem = new System({
                name: systemName,
                createdBy: interaction.user.id,
                version: 0,
                bodies: [],
                version_history: [],
            });  
            await newSystem.save();
            await sendResponseEmbed(interaction,`Nový planetární systém.`,`Vytvořila jsem Ti systém "${systemName}" (ID: ${newSystem.systemSlug})`);
            setHomeSystem(interaction, newSystem.systemSlug)
        } catch (error) {
            console.log(error)
            await sendErrorEmbed(interaction,`Něco se nepovedlo`, error.text)
        }
    }
};
