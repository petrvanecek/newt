const { Message } = require('discord.js');
const { setHomeSystem, getHomeSystem } = require('../utils.js');
const { sendErrorEmbed, sendResponseEmbed, sendInfoEmbed, sendEmbed } = require('../messaging');
const mongoose = require('mongoose');
const User = require('../models/User');
const System = require('../models/System');
const Body = require('../models/body');

module.exports = {
    data: {
        name: "create",
        order: 1,
        description: "Vytvoří nový planetární systém a vygeneruje system-id a nastaví jej jako domovský. Pokud chcete víceslovný název, musí být \"v uvozovkách\".",        
        usage: "/newt create <název>"
    },
    /**
     * 
     * @param {Message} message 
     * @param {Array<String>} args 
     * @returns 
     */
    async execute(message, args) {
        console.log("Creating new system")  
        try {
            if(args.length == 2) {
                sendInfoEmbed(message, `Příkaz create`, `${this.data.description}\n\`\`\`${this.data.usage}\`\`\``)
                return
            }

            if(args.length != 3) {
                sendErrorEmbed(message, `Chybné parametry`, `${this.data.description}\n\`\`\`${this.data.usage}\`\`\``)
                return   
            }

            const systemName = args[2]
            const newSystem = new System({
                name: systemName,
                createdBy: message.author.id,
                version: 0,
                bodies: [],
                version_history: [],
            });  
            await newSystem.save();
            await sendInfoEmbed(message,`Nový planetární systém.`,`Byl vytvořen systém "${systemName}" (ID: ${newSystem.systemSlug})`);
            setHomeSystem(message, newSystem.systemSlug)
        } catch (error) {
            console.log(error)
            await sendResponseEmbed(message,`Něco se nepovedlo`, error.text)
        }
    }
};
