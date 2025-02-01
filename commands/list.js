const { Message } = require('discord.js');
const { setHomeSystem, getHomeSystem } = require('../utils.js');
const { sendErrorEmbed, sendResponseEmbed, sendInfoEmbed, sendEmbed } = require('../messaging.js');
const mongoose = require('mongoose');
const User = require('../models/User.js');
const System = require('../models/System.js');
const Body = require('../models/body.js');

module.exports = {
    data: {
        name: "list",
        order: 3,
        description: "Zobrazí seznam všech systémů, nebo seznam objektů ve vybraném systému.",
        usage: "/newt list <?system-id>"
    },
    /**
     * 
     * @param {Message} message 
     * @param {Array<String>} args 
     * @returns 
     */
    async execute(message, args) {
        try {
            if(args.length > 4) {
                sendErrorEmbed(message, `Chybné parametry`, `${this.data.description}\n\`\`\`${this.data.usage}\`\`\``)
                return   
            }

            if(args.length == 2) {
                const systems = await System.find({});
                if (systems.length === 0) {
                    sendErrorEmbed(message, 'Seznam systémů', 'Prázdno. Jako fakt. Nic. Zero. Void. Null. Nada. Niente. 没有. 何もない.\n\nMožná bys mohl nějaký vytvořit\n```/newt create <název>```Nebo se možná podívat, co dalšího lze dělat: ```/newt help```')
                    return 
                }

                const systemInfo = systems.map(system => `### ${system.name} (id: \`${system.systemSlug}\`)\nverze: ${system.version_history.length}\npočet těles: ${system.bodies.length}`);
                sendResponseEmbed(message,'Seznam planetárních systémů', systemInfo.join('\n'), { text: `Počet systémů: ${systems.length}` })        
            } else {
                const systemSlug = args[2]; 
                const system = await System.findOne( { systemSlug } );
            
                if (!system) {
                    sendErrorEmbed(message, `Systém "${systemSlug}" neexistuje`, 'Nechceš se podívat, jaké systémy tu vlastně jsou? \n\n```/newt list```\nNebo se možná podívat, co dalšího lze dělat: ```/newt help```')
                    return
                }
            
                // Pokud systém existuje, získáme tělesa
                if (system.bodies.length === 0) {
                    sendInfoEmbed(message, `Seznam těles ${system.name} [${systemSlug}]`, 'Prázdno. Jako fakt. Nic. Zero. Void. Null. Nada. Niente. 没有. 何もない.\n\nMožná bys mohl nějaké přidat\n```/newt add ...```Nebo se možná podívat, co dalšího lze dělat: ```/newt help```')
                    return
                }
            
                // Vytvoření seznamu těles ve formátu: <name> - <type> (např. planet, star)
                const bodyInfo = system.bodies.map(body => `### ${body.planetName}\n x: ${body.params[0]} y: ${body.params[1]} vx: ${body.params[2]} vy: ${body.params[3]} mass: ${body.params[4]} radius: ${body.params[5]} RGB: ${body.params[6]} ${body.params[7]} ${body.params[8]}`);
            
                await sendInfoEmbed(message, `Seznam těles ${system.name} [${systemSlug}]`, bodyInfo.join('\n'))
            
            }
        } catch (error) {
            console.log(error)
            await sendResponseEmbed(message,`Něco se nepovedlo`, error.text)
        }
    }
};

