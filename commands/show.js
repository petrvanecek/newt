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
        name: "show",
        order: 5,
        description: "Zobrazí náhled domovského systému, případně konkrétní verzi.",        
        usage: "/newt show <?version>"
    },
    /**
     * 
     * @param {Message} message 
     * @param {Array<String>} args 
     * @returns 
     */
    async execute(message, args) {
        try {
            if(args.length > 3) {
                sendErrorEmbed(message, `Chybné parametry`, `${this.data.description}\n\`\`\`${this.data.usage}\`\`\``)
                return 
            }
                        
            var system = await getHomeSystem(message)
            if(!system) {                
                return
            }
                        
            let version = system.version
            if(args.length==3) {
        
                version = parseInt(args[2])
                const foundVersion = system.version_history.find(v => v.version === version);
                if (!foundVersion) {
                    await sendErrorEmbed(message, `Verze systému "${system.name}.${version}" neexistuje`, `Nechceš se podívat, jaké má verze: \`\`\`/newt versions\`\`\`\nNebo se možná podívat, co dalšího lze dělat: \`\`\`/newt help\`\`\``)
                    return
                }
                console.log(`nalezena verze ${version}`)
                bodies = foundVersion.bodies;
            } else {
                version = system.version;
                bodies = system.bodies;
            }
        
            if(!bodies || bodies.length == 0) {
                await sendErrorEmbed(message, `Systém "${system.name}" neobsahuje žádná tělesa`, `Nechceš se podívat, jak systém vlastně vypadá a jaké má verze: \`\`\`/newt versions\`\`\`\nNebo se možná podívat, co dalšího lze dělat: \`\`\`/newt help\`\`\``)
                return
            }
        
            const imageBuffer = await generatePreview(bodies);
            console.log(getPreviewUrlData(bodies))
            await sendResponseEmbed(message,`Systém ${system.name} (verze ${version}) `, `[live view](https://newt.vanecek.info/?data=${getPreviewUrlData(system.bodies)})`, { text: `Newt` }, imageBuffer)
        } catch (error) {
            console.log(error)
            await sendResponseEmbed(message,`Něco se nepovedlo`, error.text)
        }
    }
};

