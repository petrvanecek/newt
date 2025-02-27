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
                .setName('odemkni')
                .setDescription('Odemkne domovský systém (pokud jsi majitel).')
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

            if(system.createdBy !== interaction.user.id) {
                await sendErrorEmbed(interaction, 'Nejsi majitel', 'Tohle není tvůj systém, nemůžeš ho odemknout.')
                return
            }

            if(!system.locked) {
                await sendErrorEmbed(interaction, 'Odemčeno', 'Tenhle systém není zamčený.')
                return
            }
    
            system.locked = false
            await system.save();
            console.log(`UNLOCK> ${interaction.user.id} odemkl systém ${system.name}`)

            await sendResponseEmbed(interaction,`Systém "${system.name}" je odemčený`,`Každý ho může volně editovat.`);
        } catch (error) {
            console.log(error)
            await sendErrorEmbed(interaction,`Něco se nepovedlo`, error.text)
        }
    }
};