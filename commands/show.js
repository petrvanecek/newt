const { SlashCommandBuilder, Interaction, AttachmentBuilder } = require('discord.js');
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
                .setName('ukaž')
                .setDescription('Zobrazí náhled domovského systému, případně konkrétní verzi.')
                .addIntegerOption(option => option.setName('verze').setDescription('verze').setRequired(false))
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
            if(system) {
            } else {
                await sendErrorEmbed(interaction, 'Nemáš nastavený platný domovský systém', 'Možná bys mohl nějaký vytvořit\n```/newt vytvoř <název>```podívat se, jaké systémy jsou k dispozici: ```/newt seznam```nebo si nějaký vybrat: ```/newt domov```')
                return
            }

            let version = system.version
            let versionOpt = interaction.options.get('verze')
            let bodies
            if(versionOpt) {
                version = versionOpt.value
                const foundVersion = system.version_history.find(v => v.version === version);
                if (!foundVersion) {
                    await sendErrorEmbed(interaction, `Verze systému "${system.name}.${version}" neexistuje`, `Nechceš se podívat, jaké má verze: \`\`\`/newt verze\`\`\``)
                    return
                }
                bodies = foundVersion.bodies;
            } else {
                bodies = system.bodies;
            }

            if(!bodies || bodies.length == 0) {
                await sendErrorEmbed(interaction, `Systém "${system.name}" neobsahuje žádná tělesa`, `Nechceš se podívat, jak systém vlastně vypadá a jaké má verze: \`\`\`/newt verze\`\`\`nebo nějaké těleso přidat: \`\`\`/newt přidej\`\`\``)
                return
            }
        
            let imageBuffer = generatePreview(bodies,1);
            let { progressMessage, embed } = await sendResponseEmbed(interaction,`Systém ${system.name} (verze ${version}) `, `[live view](https://newt.vanecek.info/?data=${getPreviewUrlData(system.bodies)})`, imageBuffer)

            for(let i = 1000; i<5000; i+=1000) {

                let imageUrl = await generatePreview(bodies, i);  // Funkce pro generování obrázku

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