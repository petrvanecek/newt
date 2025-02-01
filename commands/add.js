const { Message } = require('discord.js');
const { setHomeSystem, getHomeSystem } = require('../utils.js');
const { sendErrorEmbed, sendResponseEmbed, sendInfoEmbed, sendEmbed } = require('../messaging.js');
const mongoose = require('mongoose');
const User = require('../models/User.js');
const System = require('../models/System.js');
const Body = require('../models/body.js');
const { getPreviewUrlData, generatePreview } = require('../preview.js');

module.exports = {
    data: {
        name: "add",
        order: 4,
        description: "Přidá nové těleso do domovského systému.",        
        usage: "/newt add <name> <x> <y> <vx> <vy> <r> <mass> <colorR> <colorG> <colorB>"
    },
    /**
     * 
     * @param {Message} message 
     * @param {Array<String>} args 
     * @returns 
     */
    async execute(message, args) {
        try {
            if(args.length != 12) {
                sendErrorEmbed(message, `Chybné parametry`, `${this.data.description}\n\`\`\`${this.data.usage}\`\`\``)
                return 
            }
            
            const [newt, cmd, planetName, x, y, vx, vy, mass, radius, r, g, b] = args;    
            
            var system = await getHomeSystem(message)
            if(!system) {                
                return
            }
            
            const bodyExists = system.bodies.some(body => body.planetName.toLowerCase() === planetName.toLowerCase());
            if (bodyExists) {
                return message.reply(`Těleso s názvem "${planetName}" již existuje v systému "${system.systemSlug}".`);
            }
            
            const newBody = {
                planetName,
                params: [
                    parseFloat(x),
                    parseFloat(y),
                    parseFloat(vx),
                    parseFloat(vy),
                    parseFloat(mass),
                    parseFloat(radius),
                    parseInt(r),
                    parseInt(g), 
                    parseInt(b)
                ]
            };
            
            system.bodies.push(newBody); 
            
            const newVersion = (system.version || 0) + 1; 
                system.version = newVersion; 
                system.version_history.push({
                    version: newVersion,
                    change: `přidáno ${planetName}`,
                    bodies: [...system.bodies], 
                });
            
            await system.save();
            
            const imageBuffer = await generatePreview(system.bodies);
            console.log(getPreviewUrlData(system.bodies))
            await sendResponseEmbed(message,`Systém ${system.name} - Nový objekt ${newBody.planetName} `, `[live view](https://newt.vanecek.info/?data=${getPreviewUrlData(system.bodies)})`, { text: `Newt` }, imageBuffer)
        } catch (error) {
            console.log(error)
            await sendResponseEmbed(message,`Něco se nepovedlo`, error.text)
        }
    }
};

