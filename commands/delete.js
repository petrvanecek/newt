const { SlashCommandBuilder, Interaction, AttachmentBuilder } = require('discord.js');
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
                .setName('smaž')
                .setDescription('Smaže stávající těleso v domovském systému.')
                .addStringOption(option => option.setName('název').setDescription('Jméno tělesa').setRequired(true))
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
            
            system.bodies.splice(bodyIndex, 1);

            const newVersion = (system.version || 0) + 1;
            system.version = newVersion;
            system.version_history.push({
                version: newVersion,
                change: `smazáno ${planetName}`,
                changedBy: interaction.user.name,
                bodies: [...system.bodies], 
            });

            await system.save();

            const imageBuffer = await generatePreview(system.bodies,1);
            let { progressMessage, embed } = await sendResponseEmbed(interaction,`Systém ${system.name} - Smazán objekt ${planetName} `, `[live view](https://newt.vanecek.info/?data=${getPreviewUrlData(system.bodies)})`, imageBuffer)

            for(let i = 1000; i<5000; i+=1000) {

                let imageUrl = await generatePreview(system.bodies, i);  // Funkce pro generování obrázku

                let attachment = new AttachmentBuilder(imageUrl, { name: 'preview.png' });
                embed.setImage('attachment://preview.png');
        
                await progressMessage.edit({
                    embeds: [embed],
                    files: [attachment]
                });
            }
        } catch (error) {
            console.log(error)
            await sendErrorEmbed(interaction,`Něco se nepovedlo`, error.text)
        }
    }
};

