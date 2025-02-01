const { Message } = require('discord.js');
const { setHomeSystem, getHomeSystem } = require('../utils.js');
const { sendErrorEmbed, sendResponseEmbed, sendInfoEmbed, sendEmbed } = require('../messaging.js');
const mongoose = require('mongoose');
const User = require('../models/User.js');
const System = require('../models/System.js');
const Body = require('../models/body.js');

module.exports = {
    data: {
        name: "home",
        order: 2,
        description: "Zjistí aktuální systém pokud není parametr nebo nastaví nový podle parametru system-id.",        
        usage: "/newt home <?system-id>"
    },
    /**
     * 
     * @param {Message} message 
     * @param {Array<String>} args 
     * @returns 
     */
    async execute(message, args) {
        try {
            if(args.length == 2) {
                var system = await getHomeSystem(message)
                if(system) {
                    sendInfoEmbed(message, `Tvůj aktuální systém`, `### ${system.name} [${system.systemSlug}]\nPočet těles: ${system.bodies.length}\nPoslední verze: ${system.version}`)
                }
                return
            } else if (args.length == 3) {
                var system = await setHomeSystem(message, args[2])
                if(system) {
                    sendInfoEmbed(message, `Tvůj aktuální systém byl změněn`, `### ${system.name} [${system.systemSlug}]\nPočet těles: ${system.bodies.length}\nPoslední verze: ${system.version}`)
                }
                return
            } else {
                sendErrorEmbed(message, `Chybné parametry`, `${this.data.description}\n\`\`\`${this.data.usage}\`\`\``)
                return   
            }
        } catch (error) {
            console.log(error)
            await sendResponseEmbed(message,`Něco se nepovedlo`, error.text)
        }
    }
};

