const fs = require("fs");
const path = require("path");
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder, Collection, Message } = require('discord.js');
const mongoose = require('mongoose');
const User = require('./models/User');
const System = require('./models/System');
const Body = require('./models/body');
const { generatePreview } = require('./preview');
const { sendErrorEmbed, sendResponseEmbed, sendInfoEmbed, sendEmbed } = require('./messaging');
const { getHomeSystem,setHomeSystem } = require('./utils');

// Setup MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.log(err));

// Create Discord Bot
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
    console.log(`Bot is ready as ${client.user.tag}`);
});

// Loads all available commands
const token =  process.env.DISCORD_TOKEN; 
client.login(token);

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
        console.warn(`⚠️ Skipping invalid command file: ${file}`);
    }
}


client.on('messageCreate', async message => {
    if (message.content.startsWith('/newt')) {
        const args = message.content.trim().match(/"([^"]+)"|(\S+)/g).map(arg => arg.replace(/"/g, ''));
        let command = client.commands.get(args[1]);
        if (!command) {
            await help(message, args);
        } else {
            await command.execute(message, args);
        }
    }
});

/**
 * Prints help for known commands.
 * @param {Message} message 
 * @param {Array<String>} args 
 */
async function help(message, args) {
    console.log(args)
    if (args.length === 1 || args[1] === 'help') {
        color = '#0000FF'
        title = 'Nápověda pro /newt'
    } else {
        color = '#FF0000'
        title = 'Neznámý příkaz'
    }

    let description = "**Dostupné příkazy:**\n";

    Array.from(client.commands.values()).sort((a,b)=>a.data.order - b.data.order).forEach(command => {
        description += `- \`${command.data.usage}\`\n  ${command.data.description}\n`
    });

    await sendEmbed(message, color, title, description)
}

/*
- \`zatím neumí /newt delete <planetName>\`\n  odstraní planetu ze systému\n
- \`zatím neumí /newt modify <planetName> <x> <y> <vx> <vy> <r> <mass> <colorR> <colorG> <colorB>\`\n  upraví vlastnosti planetárního tělesa\n
- \`/newt list <systems|bodies>\`\n  zobrazí seznam všech systémů\n
- \`zatím neumí /newt versions <system-id>\`\n  zobrazí historii systému\n
- \`zatím neumí /newt fork <system-id> <version> <nový název>\`\n  vytvoří kopii dané verze systému pod novým jménem\n
`)
/*
async function modifyCommand(message) {
  try {    
    const argsString = message.content.replace('/newt add ', '').trim();
    const args = argsString.match(/"([^"]+)"|(\S+)/g).map(arg => arg.replace(/"/g, ''));

    if(args.length != 13) {
      await sendErrorEmbed(message, "Chybné parametry", '```/newt modify <id-systému> <název tělesa> x y vx vy mass radius r g b```')
      return
    }

    const systemSlug = args[2];       
    const system = await System.findOne( { systemSlug } );

    if (!system) {
      sendErrorEmbed(message, `Systém "${systemSlug}" neexistuje`, 'Nechceš se podívat, jaké systémy tu vlastně jsou? \n\n```/newt list```\nNebo se možná podívat, co dalšího lze dělat: ```/newt help```')
      return
    }

  } catch (error) {
    await sendResponseEmbed(message,`Něco se nepovedlo`, error.text)
  }
}

*/
