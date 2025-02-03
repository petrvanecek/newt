const { SlashCommandBuilder, Interaction } = require('discord.js');
const { setHomeSystem, getHomeSystem, isValidOption } = require('../utils.js');
const { sendErrorEmbed, sendResponseEmbed, sendInfoEmbed, sendEmbed } = require('../messaging.js');
const mongoose = require('mongoose');
const User = require('../models/User.js');
const System = require('../models/System.js');
const Body = require('../models/body.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newt')
        .addSubcommand(subcommand =>
            subcommand
                .setName('domov')
                .setDescription('Zjistí aktuální systém pokud není parametr nebo nastaví nový podle parametru id-systému.')
                .addStringOption(option => option.setName('id-systému').setDescription('ID systému').setRequired(false))
        ),
    /**
     * 
     * @param {Interaction} interaction 
     * @param {Array<String>} args 
     * @returns 
     */
    async execute(interaction) {
        try {          
            const systemName = interaction.options.get('id-systému')
            if(!systemName) {
                var system = await getHomeSystem(interaction)
                if(system) {
                    sendInfoEmbed(interaction, `Tvůj aktuální systém`, `### ${system.name} [id ${system.systemSlug}]\nPočet těles: ${system.bodies.length}\nPoslední verze: ${system.version}`)
                }
                return
            } else {
                var system = await setHomeSystem(interaction, systemName.value)
                if(system) {
                    sendInfoEmbed(interaction, `Tvůj aktuální systém byl změněn`, `### ${system.name} [${system.systemSlug}]\nPočet těles: ${system.bodies.length}\nPoslední verze: ${system.version}`)
                }
                return
            }
        } catch (error) {
            console.log(error)
            await sendErrorEmbed(interaction,`Něco se nepovedlo`, error.text)
        }
    }
};