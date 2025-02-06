const { SlashCommandBuilder, Interaction } = require('discord.js');
const { setHomeSystem, getHomeSystem, areValidOptions } = require('../utils.js');
const { sendErrorEmbed, sendResponseEmbed, sendInfoEmbed, sendEmbed } = require('../messaging.js');
const mongoose = require('mongoose');
const User = require('../models/User.js');
const System = require('../models/System.js');
const Body = require('../models/body.js');
const { getPreviewUrlData, generatePreview } = require('../preview.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newt')
        .addSubcommand(subcommand =>
            subcommand
                .setName('uprav')
                .setDescription('Upraví stávající těleso v domovském systému.')
                //<name> <x> <y> <vx> <vy> <r> <mass> <colorR> <colorG> <colorB></colorB>
                .addStringOption(option => option.setName('název').setDescription('Jméno tělesa').setRequired(true))
                .addNumberOption(option => option.setName('x').setDescription('x souřadnice [cAU - setiny AU]').setRequired(true))
                .addNumberOption(option => option.setName('y').setDescription('y souřadnice [cAU]').setRequired(true))
                .addNumberOption(option => option.setName('vx').setDescription('počáteční rychlost x [cAU/den]').setRequired(true))
                .addNumberOption(option => option.setName('vy').setDescription('počáteční rychlost y [cAU/den]').setRequired(true))
                .addNumberOption(option => option.setName('hmotnost').setDescription('hmotnost [Mzem - násobek hmotnosti Země]').setRequired(true))
                .addNumberOption(option => option.setName('poloměr').setDescription('vizuální poloměr [cAU]').setRequired(true))
                .addIntegerOption(option => option.setName('červená').setDescription('červená barva [0..255]').setRequired(true).setMinValue(0).setMaxValue(255))
                .addIntegerOption(option => option.setName('zelená').setDescription('zelená barva [0..255]').setRequired(true).setMinValue(0).setMaxValue(255))
                .addIntegerOption(option => option.setName('modrá').setDescription('modrá barva [0..255]').setRequired(true).setMinValue(0).setMaxValue(255))
        ),
    /**
     * 
     * @param {Interaction} interaction 
     * @returns 
     */
    async execute(interaction) {
        try {
            if(!areValidOptions(interaction)) {
                sendErrorEmbed(interaction, `Chybné parametry`, `Přečti si nápovědu.`)
                return 
            }
            
            var system = await getHomeSystem(interaction)
            if(!system) {                
                await sendErrorEmbed(interaction, 'Nemáš nastavený platný domovský systém', 'Možná bys mohl nějaký vytvořit\n```/newt vytvoř <název>```podívat se, jaké systémy jsou k dispozici: ```/newt seznam```nebo si nějaký vybrat: ```/newt domov```')
                return
            }

            if(system.locked) {
                await sendErrorEmbed(interaction, 'Systém je zamčený', 'Tenhle systém nejde upravovat. Můžeš si vytvořit kopii: ```/newt kopie```')
                return
            }
            
            const planetName = interaction.options.get('název').value
            const bodyIndex = system.bodies.findIndex(body => body.planetName.toLowerCase() === planetName.toLowerCase());
            //const bodyExists = system.bodies.some(body => body.planetName.toLowerCase() === planetName.toLowerCase());
            if (Body < 0) {
                await sendErrorEmbed(interaction,`Těleso s názvem "${planetName}" neexistuje v systému "${system.name}".`,`Zkus se podívat, jaká tělesa jsou k dispozici: \`\`\`/newt seznam ${system.systemSlug}\`\`\``)
                return
            }
            
            system.bodies[bodyIndex].params = [
                interaction.options.get('x').value,
                interaction.options.get('y').value,
                interaction.options.get('vx').value,
                interaction.options.get('vy').value,
                interaction.options.get('hmotnost').value,
                interaction.options.get('poloměr').value,
                interaction.options.get('červená').value,
                interaction.options.get('zelená').value,
                interaction.options.get('modrá').value,
            ];
    
            // Aktualizace verze systému
            const newVersion = (system.version || 0) + 1;
            system.version = newVersion;
            system.version_history.push({
                version: newVersion,
                change: `změněno ${planetName}`,
                changedBy: interaction.user.name,
                bodies: [...system.bodies], 
            });
                
            await system.save();
            
            const imageBuffer = await generatePreview(system.bodies);
            await sendResponseEmbed(interaction,`Systém ${system.name} - Aktualizován objekt ${planetName} `, `[live view](https://newt.vanecek.info/?data=${getPreviewUrlData(system.bodies)})`, imageBuffer)
        } catch (error) {
            console.log(error)
            await sendErrorEmbed(interaction,`Něco se nepovedlo`, error.text)
        }
    }
};

