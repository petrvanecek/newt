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
                .setName('seznam')
                .setDescription('Zobrazí seznam všech systémů, nebo seznam objektů ve vybraném systému.')
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
                const systems = await System.find({});
                if (systems.length === 0) {
                    sendErrorEmbed(interaction, 'Seznam systémů', 'Prázdno. Jako fakt. Nic. Zero. Void. Null. Nada. Niente. 没有. 何もない.\n\nMožná bys mohl nějaký vytvořit\n```/newt create <název>```Nebo se možná podívat, co dalšího lze dělat: ```/newt help```')
                    return 
                }

                const systemInfo = systems.map(system => `### ${system.name} (id: \`${system.systemSlug}\`)\nverze: ${system.version_history.length}\npočet těles: ${system.bodies.length}`);
                sendInfoEmbed(interaction,'Seznam planetárních systémů', systemInfo.join('\n'))        
            } else {
                const systemSlug = systemName.value; 
                const system = await System.findOne( { systemSlug } );
            
                if (!system) {
                    sendErrorEmbed(interaction, `Systém "${systemSlug}" neexistuje`, 'Nechceš se podívat, jaké systémy tu vlastně jsou? \n\n```/newt seznam```')
                    return
                }
            
                // Pokud systém existuje, získáme tělesa
                if (system.bodies.length === 0) {
                    sendInfoEmbed(interaction, `Seznam těles ${system.name} [id ${systemSlug}]`, 'Prázdno. Jako fakt. Nic. Zero. Void. Null. Nada. Niente. 没有. 何もない.\n\nMožná bys mohl nějaké přidat\n```/newt přidej ...```')
                    return
                }
            
                // Vytvoření seznamu těles ve formátu: <name> - <type> (např. planet, star)
                const bodyInfo = system.bodies.map(body => `### ${body.planetName}\n x: ${body.params[0]} y: ${body.params[1]} vx: ${body.params[2]} vy: ${body.params[3]} mass: ${body.params[4]} radius: ${body.params[5]} RGB: ${body.params[6]} ${body.params[7]} ${body.params[8]}`);
            
                await sendInfoEmbed(interaction, `Seznam těles ${system.name} [id ${systemSlug}]`, bodyInfo.join('\n'))
                return
            }
        } catch (error) {
            console.log(error)
            await sendErrorEmbed(interaction,`Něco se nepovedlo`, error.text)
        }
    }
};