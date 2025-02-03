const { SlashCommandBuilder, Interaction } = require('discord.js');
const { setHomeSystem, getHomeSystem, isValidOption } = require('../utils.js');
const { sendErrorEmbed, sendResponseEmbed, sendInfoEmbed, sendEmbed } = require('../messaging.js');
const { getPreviewUrlData, generatePreview } = require('../preview.js');
const mongoose = require('mongoose');
const User = require('../models/User.js');
const System = require('../models/System.js');
const Body = require('../models/body.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newt')
        .addSubcommand(subcommand =>
            subcommand
                .setName('verze')
                .setDescription('Zobrazí poslední změny domovského systému.')
        ),
    /**
     * 
     * @param {Interaction} interaction 
     * @param {Array<String>} args 
     * @returns 
     */
    async execute(interaction) {
        try {          
            var system = await getHomeSystem(interaction)
            if(!system) {            
                await sendErrorEmbed(interaction, 'Nemáš nastavený platný domovský systém', 'Možná bys mohl nějaký vytvořit\n```/newt vytvoř <název>```podívat se, jaké systémy jsou k dispozici: ```/newt seznam```nebo si nějaký vybrat: ```/newt domov```')
                return
            }

            if (!system.version_history || system.version_history.length === 0) {
                await sendInfoEmbed(interaction, `Žádné verze`, `Systém "${system.systemSlug}" zatím nemá žádnou verzi.`);
                return;
            }
    
            const history = system.version_history
                .sort((a, b) => b.version - a.version)
                .slice(0, 10) 
                .map(v => `**v${v.version}:** ${v.change} [${v.timestamp} ${v.changeBy}]`)
                .join("\n");

            await sendInfoEmbed(interaction, `Historie verzí - ${system.name}`, history);
        } catch (error) {
            console.log(error)
            await sendErrorEmbed(interaction,`Něco se nepovedlo`, error.text)
        }
    }
};