const { SlashCommandBuilder, Interaction, ModalBuilder, TextInputBuilder,TextInputStyle, ActionRowBuilder } = require('discord.js');
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
                .setName('znič')
                .setDescription('Zničí domovský systém (pokud jsi majitel). NEVRATNÁ AKCE!')
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
                await sendErrorEmbed(interaction, 'Nejsi majitel', 'Tohle není tvůj systém, nemůžeš ho zničit.')
                return
            }

            if(system.locked) {
                await sendErrorEmbed(interaction, 'Zamčeno', 'Tenhle systém jsi zamknul. Nemůžeš ho teď zničit.')
                return
            }
    
            const modal = new ModalBuilder()
                .setCustomId('confirmDestroySystem')
                .setTitle('Potvrzení smazání');

            const input = new TextInputBuilder()
                .setCustomId('destroyConfirmation')
                .setLabel(`Napiš "smazat" pro potvrzení`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(input));

            await interaction.showModal(modal);
        
            const filter = (i) => i.customId === 'confirmDestroySystem' && i.user.id === interaction.user.id;
            try {
                const confirmation = await interaction.awaitModalSubmit({ filter, time: 60000 });
    
                if (confirmation.fields.getTextInputValue('destroyConfirmation').toLowerCase() === 'smazat') {
                    await system.deleteOne();
                    await confirmation.deferUpdate(); 
                    await sendResponseEmbed(interaction, `Systém **${system.name}** byl úspěšně zničen.`, 'Tak jsi to dokázal... Co dál?\n\nMůžeš se podívat co bys tak ještě zničil... ```/newt seznam``` \n\nTaky si nezapomeň nastavit nový domov```/newt domov```')

                    console.log(`DESTROY> ${interaction.user.id} zničil systém ${system.name}`)
                } else {
                    await confirmation.deferUpdate(); 
                    await sendErrorEmbed(interaction, 'Tak nic, no.', 'Nezadal jsi správné potvrzení. Nic se ničit nebude')
                }
            } catch (error) {
                await sendErrorEmbed(interaction, 'Tak nic, no.', 'Nezadal jsi včas potvrzení. Nic se ničit nebude')
            }
    
        } catch (error) {
            console.log(error)
            await sendErrorEmbed(interaction,`Něco se nepovedlo`, error.text)
        }
    }
};